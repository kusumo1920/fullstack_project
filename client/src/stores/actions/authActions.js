import {
  AUTHENTICATE_USER_SUCCESS,
  UNAUTHENTICATE_USER_SUCCESS,
  LOAD_USER_SUCCESS,
} from "./authActionTypes";

export const authenticateUserSuccess = (user, token) => ({
  type: AUTHENTICATE_USER_SUCCESS,
  payload: {
    user,
    token,
  },
});

export const unauthenticateUserSuccess = () => ({
  type: UNAUTHENTICATE_USER_SUCCESS,
});

export const loadUserSuccess = (user) => ({
  type: LOAD_USER_SUCCESS,
  payload: user,
});
