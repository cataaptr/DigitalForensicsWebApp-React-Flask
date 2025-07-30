import React, { useContext, useEffect, useState } from 'react';
import TopBar from "./../../Base/TopBar/TopBar.js";
import Menu from './../../Base/Menu/Menu.js';
import { SystemContext } from '../../SystemContext';
import "./LogsAnalysis.css";
import FingerPrint from "../../assets/icons/fingerprint_green.svg";
import Monitor from "../../assets/icons/monitor_green.svg";
import Cycle from "../../assets/icons/cycle_green.svg";
import Bomb from "../../assets/icons/bomb_green.svg";

const LogAnalysis = () => {
  const { selectedSnapshotId } = useContext(SystemContext);
  const [logData, setLogData] = useState(null);
  const [showAllAuth, setShowAllAuth] = useState(false);
  const [showAllSys, setShowAllSys] = useState(false);
  const [showAllBrute, setShowAllBrute] = useState(false);
  const [showAllWeb, setShowAllWeb] = useState(false);

  const [searchAuth, setSearchAuth] = useState("");
  const [searchSys, setSearchSys] = useState("");

useEffect(() => {
  if (!selectedSnapshotId) return;

  const fetchLogs = fetch(`/api/snapshot/${selectedSnapshotId}/logs`).then(res => res.json());
  const fetchAttacks = fetch(`/api/snapshot/${selectedSnapshotId}/attacks`).then(res => res.json());

  Promise.all([fetchLogs, fetchAttacks])
    .then(([logDataRaw, attackDataRaw]) => {
      const grouped = {
        auth_logs: [],
        system_logs: [],
        brute_force: [],
        web_attacks: []
      };

      

      // Grupăm logurile normale
      logDataRaw.forEach(entry => {
       const type = entry.service; 
        if (type.includes("auth")) grouped.auth_logs.push(entry);
        else if (type.includes("system")) grouped.system_logs.push(entry);
      });

      // Grupăm atacurile din baza de date
      attackDataRaw.forEach(entry => {
        if (entry.attack_type === "brute_force") {
          grouped.brute_force.push(entry);
        } else {
          grouped.web_attacks.push(entry);
        }
      });

      setLogData(grouped);
    })
    .catch(err => console.error("Eroare la fetch loguri sau atacuri:", err));
}, [selectedSnapshotId]);



  if (!logData) return <p className="loading">Se încarcă logurile...</p>;

  return (
    <div className="logAnalysis">
      <TopBar />
      <Menu />
      <span className="title">Loguri Sistem</span>

      {renderTable("Loguri de autentificare", logData.auth_logs, showAllAuth, () => setShowAllAuth(!showAllAuth), <img src={FingerPrint} className="section-icon" alt="FingerPrint" />, searchAuth, setSearchAuth)}
      {renderTable("Loguri de sistem", logData.system_logs, showAllSys, () => setShowAllSys(!showAllSys), <img src={Monitor} className="section-icon" alt="Monitor" />, searchSys, setSearchSys)}
      {renderTable("Atacuri brute-force", logData.brute_force, showAllBrute, () => setShowAllBrute(!showAllBrute), <img src={Cycle} className="section-icon" alt="Cycle" />)}
      {renderTable("Atacuri web (SQLi/XSS/CSRF)", logData.web_attacks, showAllWeb, () => setShowAllWeb(!showAllWeb), <img src={Bomb} className="section-icon" alt="Bomb" />)}
    </div>
  );
};

const parseLogLine = (line) => {
  const syslogMatch = line.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:\+\d{2}:?\d{2})?)\s+[\w\-]+\s+(\w+)\[\d+\]:\s+(.*)$/);
  if (syslogMatch) {
    const [, time, service, message] = syslogMatch;
    return {
      time: time.trim(),
      service: service.trim(),
      message: message.trim()
    };
  }

  const apacheMatch = line.match(/\[([^\]]+)\]\s+"(GET|POST|PUT|DELETE|HEAD)/);
  if (apacheMatch) {
    return {
      time: apacheMatch[1],
      service: "apache2",
      message: line
    };
  }

  const match = line.match(/^([\w\s:.-]+)\s+([\w.@-]+)\s+([^:]+):\s+(.*)$/);
  if (match) {
    const [, time, , service, message] = match;
    return {
      time: time.trim(),
      service: service.trim(),
      message: message.trim()
    };
  }

  return { time: "-", service: "-", message: line };
};

const renderTable = (title, items, showAll, toggleShowAll, icon = null, searchTerm = "", setSearchTerm = null) => {
  if (!Array.isArray(items)) return null;

  const filteredItems = searchTerm
    ? items.filter(line => {
        const entry = typeof line === 'object'
          ? `${line.timp} ${line.mesaj}` : line;

        return entry.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : items;

  const displayedItems = showAll ? filteredItems : filteredItems.slice(0, 5);

  return (
    <div className="info-section">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1 }}>
          {icon && <span className="section-icon-wrapper">{icon}</span>}
          <h2 style={{ margin: 0 }}>{title}</h2>
        </div>

        {setSearchTerm && (
          <input
            type="text"
            placeholder="Caută după timp/mesaj..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
            style={{ maxWidth: '250px' }}
          />
        )}

        {filteredItems.length > 5 && (
          <button className="expand-btn" onClick={toggleShowAll}>
            {showAll ? "▲" : "▼"}
          </button>
        )}
      </div>

      {filteredItems.length === 0 ? (
        <p className="empty">Nicio înregistrare.</p>
      ) : (
        <table className="table-no-border">
          <thead>
            <tr>
              <th>Timp</th>
              {title === "Atacuri brute-force" ? (
                <>
                  <th>IP</th>
                  <th>User</th>
                  <th>Port</th>
                </>
              ) : title.includes("web") ? (
                <>
                  <th>Tip atac</th>
                  <th>IP</th>
                  <th>Metodă</th>
                  <th>URL</th>
                </>
              ) : (
                <th>Mesaj</th>
              )}
            </tr>
          </thead>
          <tbody>
            {displayedItems.map((line, idx) => {
              let time, message;
              if (typeof line === 'object' && line !== null) {
  const full = line.timestamp || line.timp || "-";
  const [date, hour] = full.split("T");
  time = date && hour ? `${date} ${hour.slice(0, 8)}` : full;
  message = line.message || line.mesaj || "-";
}

               else {
                const parsed = parseLogLine(line);
                time = parsed.time;
                message = parsed.message;
              }

              return (
                <tr key={idx}>
                  <td>{time}</td>
                  {title === "Atacuri brute-force" && line.ip ? (
                    <>
                      <td>{line.ip}</td>
                      <td>{line.username || "-"}</td>
                      <td>{line.port || "-"}</td>
                    </>
                  ) : title.includes("web") && line.ip ? (
                    <>
                      <td>{line.attack_type || "-"}</td>
                      <td>{line.ip}</td>
                      <td>{line.method || "-"}</td>
                      <td><code>{line.url || "-"}</code></td>
                    </>
                  ) : (
                    <td>{message}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};



export default LogAnalysis;