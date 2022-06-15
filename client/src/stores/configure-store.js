import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { logger } from "redux-logger";
import reduxImmutableStateInvariant from "redux-immutable-state-invariant";
import rootReducer from "./reducers";

function configureStore() {
  const store = createStore(
    rootReducer,
    applyMiddleware(thunk, logger, reduxImmutableStateInvariant())
  );

  if (process.env.NODE_ENV !== "production") {
    if (module.hot) {
      module.hot.accept("./reducers", () => {
        store.replaceReducer(rootReducer);
      });
    }
  }

  return store;
}

export default configureStore;
