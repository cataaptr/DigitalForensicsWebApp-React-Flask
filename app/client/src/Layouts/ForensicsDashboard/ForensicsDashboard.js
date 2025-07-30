import "./ForensicsDashboard.css";
import { useContext, useEffect, useState } from "react";
import { SystemContext } from "../../SystemContext";

import TopBar from "./../../Base/TopBar/TopBar.js";
import Menu from './../../Base/Menu/Menu.js';
import Panel from './../../Base/Panel/Panel.js';

import File from "./../../assets/icons/attach_file_green.svg"; 
import Events from "./../../assets/icons/troubleshoot_green.svg"; 
import Person from "./../../assets/icons/person_user_activ_green.svg"; 
import Info from "./../../assets/icons/info_green.svg"; 

import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);
ChartJS.register(CategoryScale, LinearScale, BarElement);

const ForensicsDashboard = () => {
  const { selectedSnapshotId } = useContext(SystemContext);
  const [passwordStats, setPasswordStats] = useState(null);
  const [fileStats, setFileStats] = useState({ total: 0, suspecte: 0 });
  const [userCount, setUserCount] = useState(0);
  const [commandsPerUser, setCommandsPerUser] = useState([]);
  const [attackCount, setAttackCount] = useState(0);
  const [attackTypes, setAttackTypes] = useState({});
  const [hostname, setHostname] = useState("");

  useEffect(() => {
    if (!selectedSnapshotId) return;

    fetch(`/api/snapshot/${selectedSnapshotId}/system`)
      .then(res => res.json())
      .then(data => {
        if (data?.hostname) setHostname(data.hostname);
      });

    fetch(`/api/snapshot/${selectedSnapshotId}/users`)
      .then(res => res.json())
      .then(users => {
        setUserCount(users.length || 0);
        setCommandsPerUser(users.map(u => ({
          username: u.username,
          count: (Array.isArray(u.recent_commands) 
            ? u.recent_commands 
            : (u.recent_commands?.startsWith('[') ? JSON.parse(u.recent_commands) : u.recent_commands.split(','))
          ).length
        })));
      });

    fetch(`/api/snapshot/${selectedSnapshotId}/passwords`)
      .then(res => res.json())
      .then(passwords => {
        const cracked = passwords.filter(p => p.status === 'GĂSITĂ').length;
        const strong = passwords.filter(p => p.status === 'PUTERNICĂ').length;
        const noPassword = passwords.filter(p => p.status?.includes('fără parolă')).length;
        setPasswordStats({ cracked, strong, noPassword });
      });

    fetch(`/api/snapshot/${selectedSnapshotId}/files`)
      .then(res => res.json())
      .then(files => {
        setFileStats({
          total: files.length,
          suspecte: files.filter(f => {
            const flags = Array.isArray(f.flags)
              ? f.flags
              : (f.flags?.startsWith('[') ? JSON.parse(f.flags) : f.flags.split(','));
            return flags.length > 0;
          }).length
        });
      });

    fetch(`/api/snapshot/${selectedSnapshotId}/attacks`)
      .then(res => res.json())
      .then(attacks => {
        setAttackCount(attacks.length);
        const counts = {};
        attacks.forEach(a => {
          const type = a.attack_type || "necunoscut";
          counts[type] = (counts[type] || 0) + 1;
        });
        setAttackTypes(counts);
      });

  }, [selectedSnapshotId]);

  const pieData = {
    labels: ['Parole ghicite', 'Parole puternice', 'Fără parolă / dezactivat'],
    datasets: [
      {
        label: 'Parole utilizatori',
        data: passwordStats ? [passwordStats.cracked, passwordStats.strong, passwordStats.noPassword] : [0, 0, 0],
        backgroundColor: ['#ff4c4c', '#A7D129', '#888'],
        borderColor: ['#fff', '#fff', '#fff'],
        borderWidth: 1,
      },
    ],
  };

  const barChartData = {
    labels: commandsPerUser.map(u => u.username),
    datasets: [
      {
        label: 'Comenzi rulate',
        data: commandsPerUser.map(u => u.count),
        backgroundColor: '#A7D129'
      }
    ]
  };

  const attackChartData = {
    labels: Object.keys(attackTypes),
    datasets: [
      {
        label: "Tipuri atacuri",
        data: Object.values(attackTypes),
        backgroundColor: ['#616F39', '#255F38', '#008b8b', '#1F7D53']
      }
    ]
  };

  return (
    <div className="forensicsDashboard">
      <TopBar />
      <Menu />
      <span className="title">Dashboard</span>

      <div className="cards-container">
        <Panel className="panel" title="Informații sistem" image={Info} description={hostname || "Nespecificat"} />
        <Panel className="panel" title="Număr utilizatori" image={Person} description={userCount} />
        <Panel className="panel" title="Fișiere analizate" image={File} description={fileStats.total} />
        <Panel className="panel" title="Atacuri identificate" image={Events} description={attackCount} />
      </div>


    <div className="charts-row">
        <div className="panel">
          <h3 style={{ color: '#A7D129', marginBottom: '10px' }}>Comenzi rulate</h3>
          <div style={{ maxWidth: '800px', margin: 'auto' }}>
            <Bar data={barChartData} />
          </div>
        </div>


        
        <div className="panel">
          <h3 style={{ color: '#A7D129', marginBottom: '10px' }}>Securitate parole</h3>
          <div style={{ maxWidth: '500px', margin: 'auto' }}>
            <Pie data={pieData} />
          </div>
        </div>

        <div className="panel">
          <h3 style={{ color: '#A7D129', marginBottom: '10px' }}>Tipuri de atacuri</h3>
          <div style={{ maxWidth: '500px', margin: 'auto' }}>
            <Bar data={attackChartData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForensicsDashboard;
