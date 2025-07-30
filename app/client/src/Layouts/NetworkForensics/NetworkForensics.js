import React, { useContext, useEffect, useState } from 'react';
import { SystemContext } from '../../SystemContext.js';
import TopBar from "../../Base/TopBar/TopBar.js";
import Menu from '../../Base/Menu/Menu.js';
import "./NetworkForensics.css";
import Warning from "../../assets/icons/warning_green.svg";
import VPN from "../../assets/icons/vpn_key_green.svg";
import Radar from "../../assets/icons/radar_green.svg";

const NetworkForensics = () => {
  const { selectedSnapshotId } = useContext(SystemContext);
  const [networkData, setNetworkData] = useState(null);
  const [showAllConnections, setShowAllConnections] = useState(false);

  useEffect(() => {
    if (!selectedSnapshotId) return;

    const fetchData = async () => {
      try {
        const [networkRes, ipsRes] = await Promise.all([
          fetch(`/api/snapshot/${selectedSnapshotId}/network`),
          fetch(`/api/snapshot/${selectedSnapshotId}/ips`)
        ]);

        const networkJson = await networkRes.json();
        const ipsJson = await ipsRes.json();

        setNetworkData({
          ...networkJson,
          suspect_ips: ipsJson
        });
      } catch (err) {
        console.error("Eroare la fetch networking:", err);
      }
    };

    fetchData();
  }, [selectedSnapshotId]);

  if (!networkData) return <p className="loading">Se încarcă datele de rețea...</p>;

  const parsedConnections = (networkData.active_connections || [])
    .map(line => line.trim().split(/\s+/))
    .slice(1); // presupunem că prima linie e header

  const formatProcess = (text) => {
    const match = text.match(/"([^"]+)",pid=(\d+)/);
    if (match) {
      return `${match[1]} (PID: ${match[2]})`;
    }
    return text;
  };

  return (
    <div className="userActivity">
      <TopBar />
      <Menu />
      <span className="title">Analiză Rețea</span>

      {/* Conexiuni active */}
      <div className="info-section">
        <div className="connection-header">
          <h2>
            <img src={Radar} alt="Radar" className="section-icon" />
            Conexiuni Active
          </h2>
          <button className="expand-btn" onClick={() => setShowAllConnections(!showAllConnections)}>
            {showAllConnections ? "▲" : "▼"}
          </button>
        </div>

        <table className="table-no-border">
          <thead>
            <tr>
              <th>Protocol</th>
              <th>Stare</th>
              <th>Adresă locală</th>
              <th>Destinație</th>
              <th>Proces asociat</th>
            </tr>
          </thead>
          <tbody>
            {parsedConnections
              .slice(0, showAllConnections ? parsedConnections.length : 10)
              .map((row, idx) => {
                const [netid, state, , , local, addressPort, ...peer] = row;
                return (
                  <tr key={idx}>
                    <td>{netid}</td>
                    <td>{state}</td>
                    <td>{local}</td>
                    <td>{addressPort}</td>
                    <td>{formatProcess(peer.join(" "))}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* DNS & Gateway */}
      <div className="info-section">
        <h2>
          <img src={VPN} alt="Network" className="section-icon" />
          DNS & Gateway
        </h2>
        <p><b>Gateway local:</b> {networkData.gateway || "necunoscut"}</p>
        <p>
          <b>DNS:</b>{" "}
          {networkData.dns && networkData.dns.length > 0
            ? networkData.dns.join(", ")
            : "necunoscut"}
        </p>
      </div>

     
              {/* IP-uri suspecte */}
<div className="info-section">
  <h2>
    <img src={Warning} alt="Warning" className="section-icon" />
    IP-uri Suspecte
  </h2>

  {networkData.suspect_ips.length === 0 ? (
    <p>Nu au fost detectate IP-uri suspecte.</p>
  ) : (
    networkData.suspect_ips.map((ipInfo, index) => (
      <div className="user-card cracked" key={index}>
        <h3>{ipInfo.ip}</h3>
        <p><b>Hostname:</b> {ipInfo.hostname || "-"}</p>
        <p><b>Țară:</b> {ipInfo.country || "-"}</p>
        <p><b>Organizație:</b> {ipInfo.org || "-"}</p>
        <p><b>Locație GPS:</b> {ipInfo.loc || "-"}</p>
        <p>
          <b>Abuse Score:</b>{" "}
          <span className="score-dot-wrapper">
            {ipInfo.abuse_score}
            <span
              className={
                ipInfo.abuse_score > 70 ? "score-dot red" :
                ipInfo.abuse_score > 30 ? "score-dot yellow" :
                "score-dot green"
              }
            ></span>
          </span>
        </p>
      </div>
    ))
  )}
</div>




    </div>
  );
};

export default NetworkForensics;
