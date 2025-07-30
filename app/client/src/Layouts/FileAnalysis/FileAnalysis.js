import { useContext, useEffect, useState } from "react";
import { SystemContext } from "../../SystemContext";
import TopBar from "../../Base/TopBar/TopBar";
import Menu from "../../Base/Menu/Menu";
import "./FileAnalysis.css";
import Folder from "../../assets/icons/folder_open_green.svg";

const FileAnalysis = () => {
  const { selectedSnapshotId } = useContext(SystemContext);
  const [fileResults, setFileResults] = useState([]);
  const [showTable, setShowTable] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    //console.log("Snapshot ID:", selectedSnapshotId); // debug

    const fetchData = async () => {
      if (!selectedSnapshotId) return;

      try {
        const res = await fetch(`/api/snapshot/${selectedSnapshotId}/files`);
        if (!res.ok) throw new Error("Eroare la preluarea fișierelor");

        const data = await res.json();
        //console.log("Răspuns JSON:", data); // debug
        setFileResults(data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [selectedSnapshotId]);


  const getSeverityDot = (flags) => {
    if (flags.includes("ALERT")) return <span className="score-dot red"></span>;
    if (flags.includes("SENSIBIL") || flags.includes("SCRIERE_PUBLICA")) return <span className="score-dot yellow"></span>;
    if (flags.includes("EXECUTABIL")) return <span className="score-dot green"></span>;
    return null;
  };

  const filteredResults = fileResults.filter(entry =>
    entry.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.flags.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fileAnalysis">
      <TopBar />
      <Menu />
      <span className="title">Analiză Fișiere</span>

      <div className="info-section">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1 }}>
            <img src={Folder} alt="Folder" className="section-icon" />
            <h2 style={{ margin: 0 }}>Fișiere suspecte</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="text"
              placeholder="Caută fișier sau flag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-bar"
              style={{ maxWidth: '250px' }}
            />
            <button className="expand-btn" onClick={() => setShowTable(!showTable)}>
              {showTable ? "▲" : "▼"}
            </button>
          </div>
        </div>

        {showTable && (
          <table className="table-no-border">
            <thead>
              <tr>
                <th>Cale</th>
                <th>Mărime</th>
                <th>SHA256</th>
                <th>Flags</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan="4">Niciun fișier nu se potrivește.</td>
                </tr>
              ) : (
                filteredResults.map((entry, index) => (
                  <tr key={index}>
                    <td>
                      <div className="score-dot-wrapper">
                        {getSeverityDot(entry.flags)}
                        <div>
                          {entry.path}
                          <div className="small-text">
                            {entry.scanned_at ? new Date(entry.scanned_at).toLocaleString("ro-RO") : "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{entry.size}</td>
                    <td>{entry.sha256}</td>
                    <td>
                      {entry.flags.map((f, idx) => (
                        <span key={idx} className={f === "ALERT" ? "badge" : ""}>
                          {f}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default FileAnalysis;
