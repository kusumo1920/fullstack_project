import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { axiosPrivateInstance } from "../../libs/axios";
import { unauthenticateUserSuccess } from "../../stores/actions/authActions";
import { setNavigationSuccess } from "../../stores/actions/navigationActions";
// import useAuthApi from "./auth";
// import { setGatewayTokenSuccess } from "../../stores/actions/gatewayTokenActions";
// import useRefreshGatewayToken from './useRefreshGatewayToken';

const useAxiosPrivateInstance = () => {
  //   const authApi = useAuthApi();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const accessTokenData = useSelector((state) => state.auth);

  useEffect(() => {
    const requestIntercept = axiosPrivateInstance.interceptors.request.use(
      async (config) => {
        if (!config.headers.Authorization && accessTokenData?.token) {
          config.headers.Authorization = `Bearer ${accessTokenData?.token}`;
        } else if (!config.headers.Authorization && !accessTokenData?.token) {
          alert("Your session is expired, please login again.");
          dispatch(unauthenticateUserSuccess());
          dispatch(setNavigationSuccess("/auth/login"));
          navigate("/auth/login");
          //   const response = await authApi.getGatewayToken();
          //   config.headers.Authorization = `Bearer ${response.data.access_token}`;
          //   dispatch(setGatewayTokenSuccess(response.data.access_token));
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept = axiosPrivateInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error?.response?.status === 403) {
          alert("Your session is expired, please login again.");
          dispatch(unauthenticateUserSuccess());
          dispatch(setNavigationSuccess("/auth/login"));
          navigate("/auth/login");
        }
        // const prevRequest = error?.config;
        // if (error?.response?.status === 403 && !prevRequest?.sent) {
        //   prevRequest.sent = true;
        //   const response = await authApi.getGatewayToken();
        //   prevRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
        //   dispatch(setGatewayTokenSuccess(response.data.access_token));
        //   return axiosPrivate(prevRequest);
        // }
        // return Promise.reject(error);
      }
    );

    return () => {
      axiosPrivateInstance.interceptors.request.eject(requestIntercept);
      axiosPrivateInstance.interceptors.response.eject(responseIntercept);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessTokenData]);

  return axiosPrivateInstance;
};

export default useAxiosPrivateInstance;
