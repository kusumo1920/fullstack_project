import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { isExpired, decodeToken } from "react-jwt";

import { setNavigationSuccess } from "./stores/actions/navigationActions";
import { authenticateUserSuccess } from "./stores/actions/authActions";
import DashboardLayout from "./contents/DashboardLayout";
import AuthLayout from "./contents/AuthLayout";
import HomeDashboardPage from "./contents/HomeDashboardPage";
import GamePage from "./contents/GamePage";
import LoginPage from "./contents/LoginPage";
import RegistrationPage from "./contents/RegistrationPage";
// import "./App.css";

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const isLoggedIn = () => {
    const token = localStorage.getItem("accessToken");
    if (token === null) {
      dispatch(setNavigationSuccess("/auth/login"));
      navigate("/auth/login");
    } else if (isExpired(token)) {
      localStorage.removeItem("accessToken");
      dispatch(setNavigationSuccess("/auth/login"));
      navigate("/auth/login");
    } else {
      let decodedAccessToken = decodeToken(token);
      dispatch(
        authenticateUserSuccess(
          {
            username: decodedAccessToken.username,
            email: decodedAccessToken.email,
          },
          token
        )
      );
      dispatch(setNavigationSuccess(location.pathname));
    }
  };

  if (location.pathname === "/logout") {
    localStorage.removeItem("accessToken");
    isLoggedIn();
  }

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route path="home" element={<HomeDashboardPage />} />
        <Route path="game/:gameId" element={<GamePage />} />
      </Route>
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegistrationPage />} />
      </Route>
    </Routes>
  );
}

export default App;
