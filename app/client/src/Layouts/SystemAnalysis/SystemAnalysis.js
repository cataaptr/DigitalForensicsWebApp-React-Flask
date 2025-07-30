import React, { useContext, useEffect, useState } from 'react';
import { SystemContext } from '../../SystemContext.js';
import TopBar from "../../Base/TopBar/TopBar";
import Menu from '../../Base/Menu/Menu';
import "./SystemAnalysis.css";
import DesktopIcon from "../../assets/icons/desktop_windows_green.svg"
import NetworkIcon from "../../assets/icons/network_green.svg"
import MemoryIcon from "../../assets/icons/memory_green.svg"
import PackageIcon from "../../assets/icons/package_green.svg"

const SystemAnalysis = () => {
  const { selectedSnapshotId } = useContext(SystemContext);
  const [info, setInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!selectedSnapshotId) return;

    fetch(`/api/snapshot/${parseInt(selectedSnapshotId)}/system`)
      .then(res => res.json())
      .then(data => {
        console.log("INFO primit:", data);
        setInfo(data);
      })
      .catch(err => console.error("Eroare la preluare:", err));
  }, [selectedSnapshotId]);

  if (!selectedSnapshotId) return <p>Niciun sistem selectat.</p>;
  if (!info) return <p>Se încarcă datele pentru sistemul selectat...</p>;

  return (
    <div className="systemAnalysis">
      <TopBar />
      <Menu />
      <span className="title">Analiză Sistem</span>

      <div className="info-section">
        <h2>
          <img src={DesktopIcon} alt="Detalii sistem" className="section-icon" /> Detalii sistem
        </h2>
        <p><b>Host:</b> {info.hostname}</p>
        <p><b>Distribuție:</b> {info.distro}</p>
        <p><b>Kernel:</b> {info.kernel}</p>
        <p><b>Data instalării:</b> {info.install_date}</p>
        <p><b>Dispozitive montate:</b></p>
        <ul>
          {info.mounted_devices?.split('\n').map((dev, i) => (
            <li key={i}>{dev}</li>
          ))}
        </ul>
        <p><b>Model sistem:</b> {info.model}</p>
        <p><b>Serie:</b> {info.serial}</p>
        <p><b>Uptime:</b> {info.uptime}</p>
      </div>

      <div className="info-section">
        <h2>
          <img src={NetworkIcon} alt="Rețea" className="section-icon" /> Rețea
        </h2>
        <p><b>IP:</b> {info.ip}</p>
        <p><b>MAC:</b> {info.mac}</p>
        <p><b>Porturi ascultate:</b></p>
        <ul>
  {info.ports && info.ports.length > 0 ? (
    info.ports.map((port, i) => <li key={i}>{port}</li>)
  ) : (
    <li>–</li>
  )}
</ul>

      </div>

      <div className="info-section">
        <h2>
          <img src={MemoryIcon} alt="Hardware" className="section-icon" /> Hardware
        </h2>
        <p><b>CPU:</b> {info.cpu}</p>
        <p><b>Disk:</b> {info.disk_total} (Folosit: {info.disk_used})</p>
        <p><b>RAM:</b> {info.ram_total} (Folosit: {info.ram_used})</p>
      </div>

      <div className="info-section packages-grid">
        <div className="packages-left">
          <div className="section-header">
            <h2>
              <img src={PackageIcon} alt="Pachete" className="section-icon" /> Pachete instalate
            </h2>
          </div>
          <ul>
            {info.installed_packages
              ?.filter(pkg => pkg.name?.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((pkg, i) => (
                <li key={i}><b>{pkg.name}</b></li>
              ))}
          </ul>
        </div>

        <div className="suspicious-panel">
          <input
            type="text"
            placeholder="Caută pachet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />
          <br /><br />
          <h2>⚠️ Pachete suspecte/ critice</h2>
          <ul>
            {info.suspicious_packages?.length > 0 ? (
              info.suspicious_packages
                .filter(pkg => pkg.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((pkg, i) => (
                  <li key={i}><b className="suspicious-package">{pkg.name}</b></li>
                ))
            ) : (
              <p style={{ color: "gray", paddingTop: "6px" }}>Niciun pachet suspect detectat.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SystemAnalysis;
