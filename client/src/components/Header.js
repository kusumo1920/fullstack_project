import { useNavigate } from "react-router-dom";

import "./Header.css";

function Header() {
  const navigate = useNavigate();

  return (
    <div className="topHeader">
      <button
        onClick={() => {
          navigate("/home");
        }}
      >
        Back to home
      </button>
      <button
        onClick={() => {
          navigate("/logout");
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default Header;
