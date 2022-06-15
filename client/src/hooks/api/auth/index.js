import axiosInstance from "../../../libs/axios";

function useAuthApi() {
  const login = (payload) => {
    return axiosInstance.post("/auth/login", payload);
  };

  const register = (payload) => {
    return axiosInstance.post("/auth/register", payload);
  };

  return {
    login,
    register,
  };
}

export default useAuthApi;
