import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SystemContext } from "../../SystemContext";

import TopBar from "./../../Base/TopBar/TopBar.js";
import Menu from './../../Base/Menu/Menu.js';
import "./Settings.css";

const Settings = () => {
  const { selectedSnapshotId, setSelectedSnapshotId } = useContext(SystemContext);
  const [availableSnapshots, setAvailableSnapshots] = useState([]);
  const [currentHostname, setCurrentHostname] = useState("");
  const navigate = useNavigate();
  const [confirmMsg, setConfirmMsg] = useState("");


  
  const handleSnapshotChange = (e) => {
  const id = Number(e.target.value);
  setSelectedSnapshotId(id);
  setConfirmMsg("Versiunea a fost actualizată ✔");

  setTimeout(() => setConfirmMsg(""), 3000); // dispare după 3 sec
};

  useEffect(() => {
    if (!selectedSnapshotId) return;

    // Obține hostname curent
    fetch(`/api/snapshot/${selectedSnapshotId}/system`)
      .then(res => res.json())
      .then(data => {
        setCurrentHostname(data.hostname || "necunoscut");
        // Obține toate snapshoturile pentru acest sistem
        return fetch(`/api/snapshots/${data.hostname}`);
      })
      .then(res => res.json())
      .then(data => {
        setAvailableSnapshots(data || []);
      })
      .catch(err => console.error("Eroare la încărcarea snapshoturilor:", err));
  }, [selectedSnapshotId]);

  const handleDisconnect = () => {
    setSelectedSnapshotId(null);
    navigate("/"); // sau pagina de start
  };

  return (
    <div className="settings">
      <TopBar />
      <Menu />
      <span className="title">Setări</span>

      <div className="settings-content">
        <h3>Sistem conectat: <span style={{ color: "#A7D129" }}>{currentHostname}</span></h3>

        <div className="dropdown-snapshot">
          <label>Alege versiunea (snapshot):</label><br />
          
          <select value={selectedSnapshotId} onChange={handleSnapshotChange}>
  {availableSnapshots.length === 0 ? (
    <option disabled>Nu există snapshoturi disponibile</option>
  ) : (
    availableSnapshots.map(snap => (
      <option key={snap.id} value={snap.id}>
        {new Date(snap.timestamp + "Z").toLocaleString("ro-RO", { timeZone: "Europe/Bucharest" })}
      </option>
    ))
  )}
</select>

{confirmMsg && <p className="confirm-msg">{confirmMsg}</p>}


        </div>

        <button className="disconnect-btn" onClick={handleDisconnect}>
          Deconectează sistemul
        </button>
      </div>
    </div>
  );
};

export default Settings;
