import React from "react";
import "./Menu.css";  
import DashboardIcon from "../../assets/icons/dashboard_2_green.svg";
import SystemAnalysisIcon from "../../assets/icons/desktop_windows_green.svg";
import UserActivityIcon from "../../assets/icons/users_green.svg";
import FileAnalysisIcon from "../../assets/icons/file_green.svg";
import LogsEventsIcon from "../../assets/icons/list_green.svg";
import NetworkForensicsIcon from "../../assets/icons/network_green.svg";
import ReportIcon from "../../assets/icons/file_save_green.svg";
import SettingsIcon from "../../assets/icons/settings_green.svg";

function Menu() {
  return (
    <aside className="menu">

      <div className={`menu-item ${window.location.pathname === "/dashboard" ? "active" : ""}`}
           onClick={() => (window.location.href = "/dashboard")}>
          <img src={DashboardIcon} alt="Dashboard" />
          <span className="menu-text">Dashboard</span>
      </div>

      <div className={`menu-item ${window.location.pathname === "/system-analysis" ? "active" : ""}`}
           onClick={() => (window.location.href = "/system-analysis")}>
          <img src={SystemAnalysisIcon} alt="System Analysis" />
          <span className="menu-text">Informații Sistem</span>
      </div>

      <div className={`menu-item ${window.location.pathname === "/user-activity" ? "active" : ""}`}
           onClick={() => (window.location.href = "/user-activity")}>
          <img src={UserActivityIcon} alt="User Activity" />
          <span className="menu-text">Activitate Utilizatori</span>
      </div>

      <div className={`menu-item ${window.location.pathname === "/file-analysis" ? "active" : ""}`}
           onClick={() => (window.location.href = "/file-analysis")}>
          <img src={FileAnalysisIcon} alt="File Analysis" />
          <span className="menu-text">Analiză Fișiere</span>
      </div>

      <div className={`menu-item ${window.location.pathname === "/logs-events" ? "active" : ""}`}
           onClick={() => (window.location.href = "/logs-events")}>
          <img src={LogsEventsIcon} alt="Logs & Events" />
          <span className="menu-text">Loguri Sistem</span>
      </div>

      <div className={`menu-item ${window.location.pathname === "/network-forensics" ? "active" : ""}`}
           onClick={() => (window.location.href = "/network-forensics")}>
          <img src={NetworkForensicsIcon} alt="Network Forensics" />
          <span className="menu-text">Analiză Rețea</span>
      </div>

      <div className={`menu-item ${window.location.pathname === "/report" ? "active" : ""}`}
           onClick={() => (window.location.href = "/report")}>
          <img src={ReportIcon} alt="Report" />
          <span className="menu-text">Raport</span>
      </div>

      <div className={`menu-item ${window.location.pathname === "/settings" ? "active" : ""}`}
           onClick={() => (window.location.href = "/settings")}>
          <img src={SettingsIcon} alt="Settings" />
          <span className="menu-text">Setări</span>
      </div>

    </aside>
  );
};

export default Menu;
