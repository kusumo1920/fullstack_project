import { SET_NAVIGATION_SUCCESS } from "../actions/navigationActionTypes";

const initialState = {
  currentNavPath: "/",
};

function navigationReducer(state = initialState, action) {
  switch (action.type) {
    case SET_NAVIGATION_SUCCESS:
      return {
        currentNavPath: action.payload,
      };
    default:
      return state;
  }
}

export default navigationReducer;
