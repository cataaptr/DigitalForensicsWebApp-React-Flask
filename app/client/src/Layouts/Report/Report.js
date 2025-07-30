import { useState } from "react";
import jsPDF from "jspdf";
import TopBar from "./../../Base/TopBar/TopBar.js";
import Menu from './../../Base/Menu/Menu.js';
import "./Report.css";
import { useContext } from "react";
import { SystemContext } from "../../SystemContext";


const Report = () => {
    const { selectedSnapshotId } = useContext(SystemContext);

  const [options, setOptions] = useState({
    system: true,
    users: true,
    passwords: true,
    files: true,
    attacks: true,
    logs: true,
    network: true,
  });

  const sanitizeText = (text) => {
  return text
    .replace(/ă/g, 'a')
    .replace(/Ă/g, 'A')
    .replace(/ș/g, 's')
    .replace(/Ș/g, 'S')
    .replace(/ț/g, 't')
    .replace(/Ț/g, 'T')
    .replace(/î/g, 'i')
    .replace(/Î/g, 'I');
};


  const handleChange = (e) => {
    setOptions({ ...options, [e.target.name]: e.target.checked });
  };

 if (!selectedSnapshotId) {
  alert("Selectează mai întâi un snapshot!");
  return;
}
const snapshotId = selectedSnapshotId;


const generatePDF = async () => {
  const hasSelection = Object.values(options).some(value => value);
if (!hasSelection) {
  alert("Selectează cel puțin o secțiune pentru generare!");
  return;
}


  const doc = new jsPDF();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(18);
  doc.text("Raport Forensics", 105, 20, null, null, "center");

  doc.setFontSize(12);
  let y = 30;

  const fetchData = async (section) => {
    const response = await fetch(`/api/report/${snapshotId}/${section}`);
    return await response.json();
  };

  const drawSectionTitle = (label) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(14);
    doc.setTextColor(0, 153, 0);
    doc.text(label, 15, y);
    y += 10;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
  };

  const drawLine = (text) => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.text(text, 15, y);
    y += 7;
  };

  if (options.system) {
    const system = await fetchData("system");
    drawSectionTitle("Informatii sistem:");
    drawLine(`Distro: ${system.distro || "-"}`);
    drawLine(`CPU: ${system.cpu || "-"}`);
    drawLine(``);
    drawLine(`RAM Total: ${system.ram_total || "-"}`);
    drawLine(`Uptime: ${system.uptime || "-"}`);
    drawLine(``);
  }

  if (options.users) {
    const users = await fetchData("users");
    drawSectionTitle("Utilizatori activi:");
    users.forEach(user => {
      drawLine(`- ${user.username} (${user.shell})`);
      drawLine(``);
    });
  }

  if (options.passwords) {
    const passwords = await fetchData("passwords");
    drawSectionTitle("Parole gasite:");
    passwords.forEach(p => {
      drawLine(sanitizeText(`- ${p.username}: ${p.status}${p.cracked_password ? ` (parola: ${p.cracked_password})` : ""}`));
      drawLine(``);
    });
  }

  if (options.files) {
    const files = await fetchData("files");
    drawSectionTitle("Fisiere suspecte:");
    files.forEach(f => {
      drawLine(`- ${f.path} [${f.size}]`);
      drawLine(``);
    });
  }

  if (options.attacks) {
    const attacks = await fetchData("attacks");
    drawSectionTitle("Atacuri detectate:");
    attacks.forEach(a => {
      drawLine(`- ${a.timestamp}: ${a.attack_type} de la ${a.ip}`);
      drawLine(``);
    });
  }

  if (options.logs) {
    const { logs, logins } = await fetchData("logs");
    drawSectionTitle("Loguri sistem:");
    logs.forEach(l => {
      drawLine(`- ${l.service}: ${l.message}`);
    });
    drawSectionTitle("Logari recente:");
    logins.forEach(l => {
      drawLine(`- ${l.username} de la ${l.ip} (${l.start})`);
      drawLine(``);
    });
  }

  if (options.network) {
    const network = await fetchData("network");
    drawSectionTitle("Informatii retea:");
    drawLine(`Gateway: ${network.gateway}`);
    drawLine(`DNS: ${Array.isArray(network.dns) ? network.dns.join(", ") : network.dns}`);
    drawLine(`Firewall: ${JSON.stringify(network.firewall)}`);
    drawLine(``);
  }

  doc.save("raport_forensics.pdf");
};


  return (
    <div className="report">
      <TopBar />
      <Menu />
      <span className="title">Raport</span>

      <div className="report-options">
        <h3>Selectează informațiile pentru raport:</h3>
        <div className="checkbox-group">
          <label><input type="checkbox" name="system" checked={options.system} onChange={handleChange} /> Informații sistem</label>
          <label><input type="checkbox" name="users" checked={options.users} onChange={handleChange} /> Utilizatori & activitate</label>
          <label><input type="checkbox" name="passwords" checked={options.passwords} onChange={handleChange} /> Parole sparte / puternice</label>
          <label><input type="checkbox" name="files" checked={options.files} onChange={handleChange} /> Fișiere suspecte</label>
          <label><input type="checkbox" name="attacks" checked={options.attacks} onChange={handleChange} /> Atacuri detectate</label>
          <label><input type="checkbox" name="logs" checked={options.logs} onChange={handleChange} /> Loguri și evenimente</label>
          <label><input type="checkbox" name="network" checked={options.network} onChange={handleChange} /> Informații rețea</label>
        </div>

        <button className="download-btn" onClick={generatePDF}>Descarcă Raport PDF</button>
      </div>
    </div>
  );
};

export default Report;
