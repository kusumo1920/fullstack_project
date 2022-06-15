import { SET_NAVIGATION_SUCCESS } from "./navigationActionTypes";

export const setNavigationSuccess = (navPath) => ({
  type: SET_NAVIGATION_SUCCESS,
  payload: navPath,
});
