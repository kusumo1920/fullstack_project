import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import useGameApi from "../hooks/api/game";
import "./GamePage.css";

function GamePage() {
  const [game, setGame] = useState(null);
  const [gamePlayers, setGamePlayers] = useState(null);
  const [gameHistory, setGameHistory] = useState(null);
  const [gamePlayerWithHistory, setGamePlayerWithHistory] = useState(null);

  const pageParams = useParams();
  const gameApi = useGameApi();

  async function fetchCompleteData() {
    let rawResponse = null;
    let errorData = null;

    try {
      rawResponse = await gameApi.getCompleteData(pageParams.gameId);
    } catch (err) {
      errorData = err;
    }

    if (!errorData && rawResponse?.data?.code === 200) {
      const game = rawResponse.data.data.game;
      const gamePlayers = rawResponse.data.data.game_players;
      const gameHistory = rawResponse.data.data.game_history;

      setGame(game);
      setGamePlayers(gamePlayers);
      setGameHistory(gameHistory);

      const gamePlayerWithHistory = gamePlayers.map((player) => {
        const histories = gameHistory.filter(
          (item) => item.game_player_id === player.id
        );
        return histories.reverse();
      });

      console.log("gamePlayerWithHistory: ", gamePlayerWithHistory);

      setGamePlayerWithHistory(gamePlayerWithHistory);
    } else {
      alert("Failed in getting game data.");
    }
  }

  useEffect(() => {
    fetchCompleteData();
  }, []);

  const playAgain = async () => {
    let rawResponse = null;
    let errorData = null;

    try {
      rawResponse = await gameApi.play(pageParams.gameId);
    } catch (err) {
      errorData = err;
    }

    if (!errorData && rawResponse?.data?.code === 200) {
      alert("Game is played");
    } else {
      alert("An error occured, game cannot be played.");
    }

    fetchCompleteData();
  };

  return (
    <div className="gamePage">
      <h1>Game #{pageParams.gameId}</h1>

      {game && !game.is_finished && (
        <div>
          <button onClick={playAgain}>Play another round</button>
        </div>
      )}

      <div>
        <h2>General Information</h2>
        <p>Number of players: {gamePlayers?.length}</p>
        <p>Number of initial dices: {game?.initial_dices}</p>
        <hr />
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Last score</th>
              <th>Is winner?</th>
            </tr>
          </thead>
          <tbody>
            {gamePlayers &&
              gamePlayers.map((player, idx) => {
                return (
                  <tr key={`game-player-${idx}`}>
                    <td>{player.name}</td>
                    <td>{player.last_score || "-"}</td>
                    <td>
                      {player.is_winner === null
                        ? "not yet decided"
                        : player.is_winner
                        ? "Winner"
                        : "-"}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <div>
        <h2>History</h2>
        <table className="gameHistoryTable">
          <thead>
            <tr>
              <th>Player</th>
              {gamePlayerWithHistory &&
                gamePlayerWithHistory[0]?.map((item, idx) => {
                  return <th key={`th-round-${idx}`}>Round #{idx}</th>;
                })}
            </tr>
          </thead>
          <tbody>
            {gamePlayers &&
              gamePlayers.map((player, idx) => {
                return (
                  <tr>
                    <td>{player.name}</td>
                    {gamePlayerWithHistory &&
                      gamePlayerWithHistory[idx].map((history, idx2) => {
                        return (
                          //   <>
                          <td key={`game-player-history-${idx2}`}>
                            <p>before score: {history.before_score || "-"}</p>
                            <p>after score: {history.after_score || "-"}</p>
                            <p>
                              dices (before):{" "}
                              {history.before_dices.toString() || "-"}
                            </p>
                            <p>
                              dices (after evaluation):{" "}
                              {history.after_dices.toString() || "-"}
                            </p>
                          </td>
                          //   </>
                        );
                      })}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GamePage;
