import React, { useState } from "react";
import useAuthApi from "../hooks/api/auth";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { setNavigationSuccess } from "../stores/actions/navigationActions";

function RegistrationPage() {
  const [email, setEmail] = useState(null);
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [isRegistering, setIsRegistering] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authApi = useAuthApi();

  const onChangeFormField = (e) => {
    if (e.target.name === "username") {
      setUsername(e.target.value);
    } else if (e.target.name === "email") {
      setEmail(e.target.value);
    } else if (e.target.name === "password") {
      setPassword(e.target.value);
    }
  };

  const onClickRegister = async () => {
    setIsRegistering(true);
    const payload = {
      email,
      username,
      password,
    };

    let rawResponse = null;
    let errorData = null;

    try {
      rawResponse = await authApi.register(payload);
    } catch (err) {
      errorData = err;
    }

    setIsRegistering(false);

    if (!errorData && rawResponse?.data?.code === 200) {
      dispatch(setNavigationSuccess("/auth/login"));
      navigate("/auth/login");
      alert("Successfully registered.");
    } else {
      alert("An error occured, please re-check your input.");
    }
  };

  return (
    <div>
      <div>
        <input
          name="email"
          type="text"
          placeholder="Input email"
          onChange={onChangeFormField}
        />
      </div>
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
        <button onClick={onClickRegister}>Register</button>
      </div>
      <div>
        <a
          onClick={() => {
            navigate("/auth/login");
          }}
        >
          Have an account? Click here to login.
        </a>
      </div>
    </div>
  );
}

export default RegistrationPage;
