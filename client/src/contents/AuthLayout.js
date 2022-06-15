import { Outlet, useNavigate } from "react-router-dom";

import "./AuthLayout.css";

function AuthLayout() {
  return (
    <div className="authLayout">
      <Outlet />
    </div>
  );
}

export default AuthLayout;
