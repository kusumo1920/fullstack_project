import React, { useState } from "react";
import useAuthApi from "../hooks/api/auth";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { decodeToken } from "react-jwt";

import { setNavigationSuccess } from "../stores/actions/navigationActions";
import { authenticateUserSuccess } from "../stores/actions/authActions";

function LoginPage() {
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authApi = useAuthApi();

  const onChangeFormField = (e) => {
    if (e.target.name === "username") {
      setUsername(e.target.value);
    } else if (e.target.name === "password") {
      setPassword(e.target.value);
    }
  };

  const onClickLogin = async () => {
    setIsLoggingIn(true);
    const payload = {
      username,
      password,
    };

    let rawResponse = null;
    let errorData = null;

    try {
      rawResponse = await authApi.login(payload);
    } catch (err) {
      errorData = err;
    }

    setIsLoggingIn(false);

    if (!errorData && rawResponse?.data?.code === 200) {
      let responsePayload = rawResponse.data;
      let decodedAccessToken = decodeToken(responsePayload.data.access_token);
      localStorage.setItem("accessToken", responsePayload.data.access_token);
      dispatch(
        authenticateUserSuccess(
          {
            username: decodedAccessToken.username,
            email: decodedAccessToken.email,
          },
          responsePayload.data.access_token
        )
      );
      dispatch(setNavigationSuccess("/home"));
      navigate("/home");
    } else {
      alert("invalid username / password.");
    }
  };

  return (
    <div>
      <div>
        <input
          name="username"
          type="text"
          placeholder="Input username"
          onChange={onChangeFormField}
        />
      </div>
      <div>
        <input
          name="password"
          type="password"
          placeholder="Input password"
          onChange={onChangeFormField}
        />
      </div>
      <div>
        <button onClick={onClickLogin}>Login</button>
      </div>
      <div>
        <a
          onClick={() => {
            navigate("/auth/register");
          }}
        >
          Didn't have an account? Click here to register a new one.
        </a>
      </div>
    </div>
  );
}

export default LoginPage;
