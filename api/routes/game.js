var express = require("express");
const _ = require("lodash");
var router = express.Router();
const { PrismaClient } = require("@prisma/client");

const { authenticateToken } = require("../middleware/auth/");

const prisma = new PrismaClient();

function randomNumberGenerator(upperBound) {
  return Math.floor(Math.random() * upperBound) + 1;
}

function randomDices(numberOfDices) {
  return [...Array(numberOfDices).keys()].map((item) => {
    return randomNumberGenerator(6);
  });
}

router.post("/create", authenticateToken, async function (req, res, next) {
  const requestBody = req.body;

  if (requestBody.number_of_player < 1) {
    return res.status(400).json({
      code: 400,
      message: "Number of game player / dice cannot be less than 1.",
      data: null,
    });
  }

  let gamePlayers = [...Array(requestBody.number_of_player).keys()].map(
    (item) => {
      return {
        name: `Player #${item + 1}`,
        last_score: 0,
      };
    }
  );

  let gameFromDb = null;
  let gamePlayersFromDb = null;

  try {
    await prisma.$transaction(async (prisma) => {
      gameFromDb = await prisma.game.create({
        data: {
          user_id: req.user.id,
          is_finished: false,
          initial_dices: requestBody.number_of_dice,
        },
      });

      gamePlayers = gamePlayers.map((item) => {
        item.game_id = gameFromDb.id;
        return item;
      });

      gamePlayersFromDb = await prisma.gamePlayer.createMany({
        data: gamePlayers,
      });

      return { gameFromDb, gamePlayersFromDb };
    });
  } catch (err) {
    console.log("err: ", err);
  }

  return res.status(200).json({
    code: 200,
    message: "Successfully creating new game.",
    data: {
      game: gameFromDb,
    },
  });
});

router.get("/play/:gameId", authenticateToken, async function (req, res, next) {
  const gameId = Number(req.params.gameId);

  let gameHistory = null;
  let game = null;
  let gamePlayers = null;

  try {
    game = await prisma.game.findFirst({
      where: {
        id: gameId,
        user_id: req.user.id,
      },
    });

    gamePlayers = await prisma.gamePlayer.findMany({
      where: {
        game_id: game.id,
      },
    });

    gameHistory = await prisma.gameHistory.findMany({
      where: {
        game_id: game.id,
      },
      orderBy: {
        updated_at: "desc",
      },
    });
  } catch (err) {
    console.log("err: ", err);
  }

  if (!game) {
    return res.status(400).json({
      code: 400,
      message: "Game is not found.",
      data: null,
    });
  }

  if (game.is_finished) {
    return res.status(400).json({
      code: 400,
      message: "Game is over.",
      data: null,
    });
  }

  if (gameHistory.length === 0) {
    const playerDices = [...Array(gamePlayers.length).keys()].map((item) =>
      randomDices(game.initial_dices)
    );

    const playerScores = [...Array(gamePlayers.length).keys()].map((item) => 0);

    let clonedPlayerDices = _.cloneDeep(playerDices);
    const clonedPlayerScores = [...Array(gamePlayers.length).keys()].map(
      (item) => 0
    );

    const additionalDicesForPlayers = [...Array(gamePlayers.length).keys()].map(
      (item) => []
    );

    for (
      let i = 0;
      i < clonedPlayerDices.length && clonedPlayerDices.length > 1;
      ++i
    ) {
      clonedPlayerDices[i] = clonedPlayerDices[i].filter((item) => {
        if (item === 6) {
          clonedPlayerScores[i] += 1;
        } else if (item === 1) {
          if (i < clonedPlayerDices.length - 1) {
            additionalDicesForPlayers[i + 1].push(item);
          } else {
            additionalDicesForPlayers[0].push(item);
          }
        }

        return item !== 6 && item !== 1;
      });
    }

    clonedPlayerDices = clonedPlayerDices.map((item, idx) =>
      item.concat(additionalDicesForPlayers[idx])
    );

    const newGameHistory = gamePlayers.map((player, idx) => {
      return {
        game_id: game.id,
        game_player_id: player.id,
        before_score: playerScores[idx],
        after_score: clonedPlayerScores[idx],
        before_dices: playerDices[idx],
        after_dices: clonedPlayerDices[idx],
      };
    });

    let isGameFinished = false;
    let numberOfPlayerOwnsDice = 0;
    let highestScore = Math.max(...clonedPlayerScores);
    let highestScorePlayerIdx = clonedPlayerScores.indexOf(highestScore);

    clonedPlayerDices.forEach((item, idx) => {
      if (item.length > 0) {
        numberOfPlayerOwnsDice += 1;
      }
    });

    if (numberOfPlayerOwnsDice > 1) {
      isGameFinished = false;
    } else {
      isGameFinished = true;
    }

    let updatedGamePlayers = gamePlayers.map((player, idx) => {
      return {
        id: player.id,
        game_id: game.id,
        name: player.name,
        last_score: clonedPlayerScores[idx],
        ...(!isGameFinished
          ? {}
          : clonedPlayerScores[idx] === highestScore
          ? { is_winner: true }
          : { is_winner: false }),
      };
    });

    try {
      await prisma.$transaction(async (prisma) => {
        const gameHistoryFromDb = await prisma.gameHistory.createMany({
          data: newGameHistory,
        });

        if (isGameFinished) {
          const gameFromDb = await prisma.game.update({
            where: {
              id: game.id,
            },
            data: {
              is_finished: true,
            },
          });
        }

        for (let i = 0; i < updatedGamePlayers.length; ++i) {
          const gamePlayerFromDb = await prisma.gamePlayer.update({
            where: {
              id: updatedGamePlayers[i].id,
            },
            data: updatedGamePlayers[i],
          });
        }

        return {};
      });
    } catch (err) {
      console.log("err: ", err);
    }
  } else {
    const lastGameHistoryEachPlayer = gamePlayers.map((player, idx) => {
      const lastHistory = gameHistory.find(
        (history) => history.game_player_id === player.id
      );
      return lastHistory;
    });

    let beforePlayerScores = lastGameHistoryEachPlayer.map((item) => {
      return item.after_score;
    });

    let beforePlayerDices = lastGameHistoryEachPlayer.map((item) => {
      return item.after_dices;
    });

    let afterPlayerScores = _.cloneDeep(beforePlayerScores);

    let nonEmptyDicesPlayerIdx = [];
    let beforePlayerDicesFinal = [];
    let afterPlayerDices = [];
    for (let i = 0; i < beforePlayerDices.length; ++i) {
      if (beforePlayerDices[i].length !== 0) {
        nonEmptyDicesPlayerIdx.push(i);
        let randomDicesResult = randomDices(beforePlayerDices[i].length);
        afterPlayerDices.push({
          idx: i,
          dices: randomDicesResult,
        });
        beforePlayerDicesFinal.push(_.cloneDeep(randomDicesResult));
      } else {
        beforePlayerDicesFinal.push([]);
      }
    }

    const additionalDicesForPlayers = afterPlayerDices.map((item) => []);

    for (
      let i = 0;
      i < afterPlayerDices.length && afterPlayerDices.length > 1;
      ++i
    ) {
      afterPlayerDices[i].dices = afterPlayerDices[i].dices.filter((item) => {
        if (item === 6) {
          afterPlayerScores[afterPlayerDices[i].idx] += 1;
        } else if (item === 1) {
          if (i < afterPlayerDices.length - 1) {
            additionalDicesForPlayers[i + 1].push(item);
          } else {
            additionalDicesForPlayers[0].push(item);
          }
        }

        return item !== 6 && item !== 1;
      });
    }

    afterPlayerDices = afterPlayerDices.map((item, idx) => {
      item.dices = item.dices.concat(additionalDicesForPlayers[idx]);
      return item;
    });

    let afterPlayerDicesFinal = gamePlayers.map((item, idx) => {
      const foundSameIdx = afterPlayerDices.find((item) => item.idx === idx);
      if (!foundSameIdx) {
        return [];
      } else {
        return foundSameIdx.dices;
      }
    });

    const newGameHistory = gamePlayers.map((player, idx) => {
      return {
        game_id: game.id,
        game_player_id: player.id,
        before_score: beforePlayerScores[idx],
        after_score: afterPlayerScores[idx],
        before_dices: beforePlayerDicesFinal[idx],
        after_dices: afterPlayerDicesFinal[idx],
      };
    });

    let isGameFinished = false;
    let numberOfPlayerOwnsDice = 0;
    let highestScore = Math.max(...afterPlayerScores);
    let highestScorePlayerIdx = afterPlayerScores.indexOf(highestScore);

    afterPlayerDicesFinal.forEach((item, idx) => {
      if (item.length > 0) {
        numberOfPlayerOwnsDice += 1;
      }
    });

    if (numberOfPlayerOwnsDice > 1) {
      isGameFinished = false;
    } else {
      isGameFinished = true;
    }

    let updatedGamePlayers = gamePlayers.map((player, idx) => {
      return {
        id: player.id,
        game_id: game.id,
        name: player.name,
        last_score: afterPlayerScores[idx],
        ...(!isGameFinished
          ? {}
          : afterPlayerScores[idx] === highestScore
          ? { is_winner: true }
          : { is_winner: false }),
      };
    });

    try {
      await prisma.$transaction(async (prisma) => {
        const gameHistoryFromDb = await prisma.gameHistory.createMany({
          data: newGameHistory,
        });

        if (isGameFinished) {
          const gameFromDb = await prisma.game.update({
            where: {
              id: game.id,
            },
            data: {
              is_finished: true,
            },
          });
        }

        for (let i = 0; i < updatedGamePlayers.length; ++i) {
          const gamePlayerFromDb = await prisma.gamePlayer.update({
            where: {
              id: updatedGamePlayers[i].id,
            },
            data: updatedGamePlayers[i],
          });
        }

        return {};
      });
    } catch (err) {
      console.log("err: ", err);
    }
  }

  return res.status(200).json({
    code: 200,
    message: "Successfully play game 1 round.",
    data: {},
  });
});

router.get(
  "/complete-data/:gameId",
  authenticateToken,
  async function (req, res, next) {
    const gameId = Number(req.params.gameId);

    let gameHistory = null;
    let game = null;
    let gamePlayers = null;

    try {
      game = await prisma.game.findFirst({
        where: {
          id: gameId,
          user_id: req.user.id,
        },
      });

      gamePlayers = await prisma.gamePlayer.findMany({
        where: {
          game_id: game.id,
        },
      });

      gameHistory = await prisma.gameHistory.findMany({
        where: {
          game_id: game.id,
        },
        orderBy: {
          updated_at: "desc",
        },
      });
    } catch (err) {
      console.log("err: ", err);
    }

    if (!game) {
      return res.status(400).json({
        code: 400,
        message: "Game is not found.",
        data: null,
      });
    }

    return res.status(200).json({
      code: 200,
      message: "Successfully retrieving game data.",
      data: {
        game: game,
        game_players: gamePlayers,
        game_history: gameHistory,
      },
    });
  }
);

router.get("/game-history", authenticateToken, async function (req, res, next) {
  let games = [];

  try {
    games = await prisma.game.findMany({
      where: {
        user_id: req.user.id,
      },
    });
  } catch (err) {
    console.log("err: ", err);
  }

  return res.status(200).json({
    code: 200,
    message: "Successfully retrieving game data.",
    data: {
      games,
    },
  });
});

module.exports = router;
