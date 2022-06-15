import { Outlet, useNavigate } from "react-router-dom";

import Header from "../components/Header";
import "./DashboardLayout.css";

function DashboardLayout() {
  return (
    <div className="dashboardLayout">
      <Header />
      <Outlet />
    </div>
  );
}

export default DashboardLayout;
