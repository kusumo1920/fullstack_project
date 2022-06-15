import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import useGameApi from "../hooks/api/game";
import "./HomeDashboardPage.css";

function HomeDashboardPage() {
  const [games, setGames] = useState(null);
  const [numberOfPlayers, setNumberOfPlayers] = useState(null);
  const [numberOfDices, setNumberOfDices] = useState(null);

  const gameApi = useGameApi();
  const navigate = useNavigate();

  const onChangeFormField = (e) => {
    if (e.target.name === "numberOfPlayers") {
      setNumberOfPlayers(e.target.value);
    } else if (e.target.name === "numberOfDices") {
      setNumberOfDices(e.target.value);
    }
  };

  useEffect(() => {
    async function getGames() {
      let rawResponse = null;
      let errorData = null;

      try {
        rawResponse = await gameApi.getGames();
      } catch (err) {
        errorData = err;
      }

      if (!errorData && rawResponse?.data?.code === 200) {
        setGames(rawResponse.data.data.games);
      } else {
        alert("An error occured while getting previous game data.");
      }
    }

    getGames();
  }, []);

  const onClickCreateGame = async () => {
    const payload = {
      number_of_player: Number(numberOfPlayers),
      number_of_dice: Number(numberOfDices),
    };

    let rawResponse = null;
    let errorData = null;

    try {
      rawResponse = await gameApi.create(payload);
    } catch (err) {
      errorData = err;
    }

    if (!errorData && rawResponse?.data?.code === 200) {
      const game = rawResponse.data.data.game;
      navigate(`/game/${game.id}`);
    } else {
      alert("An error occured, please check your input.");
    }
  };

  return (
    <div className="homeDashboardPage">
      <h1>Home Dashboard Page</h1>
      <div>
        <div>
          <input
            name="numberOfPlayers"
            type="number"
            placeholder="Input number of players (>1)"
            onChange={onChangeFormField}
          />
        </div>
        <div>
          <input
            name="numberOfDices"
            type="number"
            placeholder="Input number of dices"
            onChange={onChangeFormField}
          />
        </div>
        <div>
          <button onClick={onClickCreateGame}>Create new game</button>
        </div>
        <div>
          <h2>Previous Games</h2>
          <table>
            <thead>
              <tr>
                <th>Game Id</th>
                <th>Is finished?</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {games &&
                games.map((game, idx) => {
                  return (
                    <tr key={`games-${idx}`}>
                      <td>{game.id}</td>
                      <td>{game.is_finished ? "yes" : "no"}</td>
                      <td>
                        <button
                          onClick={() => {
                            navigate(`/game/${game.id}`);
                          }}
                        >
                          See detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default HomeDashboardPage;
