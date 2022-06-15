import { combineReducers } from "redux";
import authReducer from "./authReducer";
import navigationReducer from "./navigationReducer";

const rootReducer = combineReducers({
  auth: authReducer,
  navigation: navigationReducer,
});

export default rootReducer;
