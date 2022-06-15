import {
  AUTHENTICATE_USER_SUCCESS,
  UNAUTHENTICATE_USER_SUCCESS,
  LOAD_USER_SUCCESS,
} from "../actions/authActionTypes";

const initialState = {
  isAuthenticated: null,
  user: null,
  token: localStorage.getItem("accessToken"),
};

function authReducer(state = initialState, action) {
  switch (action.type) {
    case AUTHENTICATE_USER_SUCCESS:
      return {
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case UNAUTHENTICATE_USER_SUCCESS:
      return {
        user: null,
        isAuthenticated: false,
        token: null,
      };
    case LOAD_USER_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
      };
    default:
      return state;
  }
}

export default authReducer;
