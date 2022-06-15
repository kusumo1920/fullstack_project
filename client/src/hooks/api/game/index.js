import useAxiosPrivateInstance from "../useAxiosPrivateInstance";

function useGameApi() {
  const axiosPrivateInstance = useAxiosPrivateInstance();

  const create = (payload) => {
    return axiosPrivateInstance.post("/game/create", payload);
  };

  const play = (gameId) => {
    return axiosPrivateInstance.get(`/game/play/${gameId}`);
  };

  const getCompleteData = (gameId) => {
    return axiosPrivateInstance.get(`/game/complete-data/${gameId}`);
  };

  const getGames = () => {
    return axiosPrivateInstance.get(`/game/game-history/`);
  };

  return {
    create,
    play,
    getCompleteData,
    getGames,
  };
}

export default useGameApi;
