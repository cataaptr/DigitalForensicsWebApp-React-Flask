import { useContext, useEffect, useState } from 'react';
import { SystemContext } from '../../SystemContext.js';
import TopBar from "../../Base/TopBar/TopBar";
import Menu from '../../Base/Menu/Menu';
import './UserActivity.css'; 
import Eye from "../../assets/icons/visibility_green.svg"
import EyeOff from "../../assets/icons/visibility_off_green.svg"
import Check from "../../assets/icons/check_red.svg"
import Person from "../../assets/icons/person_user_activ_green.svg"
import Lock from "../../assets/icons/lock_green.svg"
import History from "../../assets/icons/history_green.svg"
import Padding from "../../assets/icons/pending_actions_green.svg"
import Terminal from "../../assets/icons/terminal_green.svg"


const UserActivity = () => {
  const { selectedSnapshotId } = useContext(SystemContext);
  const [systemData, setSystemData] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
const [showAll, setShowAll] = useState(false);
const [expandedUsers, setExpandedUsers] = useState({});


const filteredLogins = systemData?.login_history?.filter((row) =>
  row.toLowerCase().includes(searchTerm.toLowerCase())
) || [];

const displayedLogins = showAll ? filteredLogins : filteredLogins.slice(0, 10);



  const interpretTerminal = (terminal, user) => {
    if (terminal === 'system') return 'Reboot sistem';
    if (typeof terminal === 'string' && terminal.startsWith('tty')) return 'Sesiune locală grafică';
    if (typeof terminal === 'string' && terminal.startsWith('pts')) return 'Terminal virtual (ex. terminal sau SSH)';
    if (user === 'reboot') return 'Reboot raportat';
    if (terminal === 'runlevel') return 'Schimbare runlevel (nivel execuție)';
    return 'Necunoscut';
  };
  

useEffect(() => {
  if (selectedSnapshotId) {
    Promise.all([
      fetch(`/api/snapshot/${selectedSnapshotId}/users`).then(res => res.json()),
      fetch(`/api/snapshot/${selectedSnapshotId}/passwords`).then(res => res.json()),
      fetch(`/api/snapshot/${selectedSnapshotId}/login-history`).then(res => res.json())
    ]).then(([users, passwords, loginHistory]) => {
      setSystemData({
        users,
        cracked_passwords: Object.fromEntries(
          passwords.map(p => [p.username, { status: p.status, parola: p.cracked_password }])
        ),
        login_history: loginHistory.map(l =>
          `${l.username} ${l.terminal} ${l.ip} ${l.start} (${l.duration})`
        )
      });
    });
  }
}, [selectedSnapshotId]);



  const togglePassword = (user) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [user]: !prev[user]
    }));
  };

  const toggleUserCommands = (username) => {
  setExpandedUsers(prev => ({
    ...prev,
    [username]: !prev[username]
  }));
};


  if (!systemData) return <p className="loading">Se încarcă datele...</p>;

  const { users, cracked_passwords, root_users} = systemData;
  const sudoList = root_users?.sudo
  ? root_users.sudo.split(":").pop().split(",").map(u => u.trim())
  : [];



  return (
    <div className="userActivity">

      <TopBar />
      <Menu />

      <span className="title">Activitate Utilizatori</span>
      

      <div className="info-section">
        <h2><img src={Person} alt="User" className="section-icon" /> Utilizatori sistem</h2>
        <div >
          {users.map(user => (
            <div key={user.username} className="user-card" style={{ minWidth: '280px', flex: '1 1 30%' }}>
              <h3>{user.username} {user.active_now && <span className="badge active">activ la acel moment</span>}</h3>
              <p><b>UID:</b> {user.uid}</p>
              <p><b>Shell:</b> {user.shell}</p>
              <p><b>Home:</b> {user.home}</p>
              <p><b>Grupuri:</b> {user.groups}</p>
              <p><b>Ultim login:</b> {user.last_login}</p>
              {sudoList.includes(user.username) && (
                <p><b>Permisiuni sudo:</b>{' '}<img src={Check} alt="checked" className="section-icon" /></p>
              )}
            </div>
          ))}
        </div>
      </div>
    
    
         {/* CARD 2: Parole sparte / nesparte */}
      <div className="info-section">
        <h2>
          <img src={Lock} alt="Lock" className="section-icon" /> Testare parole
        </h2>
        {Object.entries(cracked_passwords).map(([user, info]) => {
  const isCracked = info.status === 'GĂSITĂ';

  return (
    <div className={`user-card ${isCracked ? 'cracked' : ''}`} key={user}>
      <h3>
        {user}
        {isCracked && <span className="badge danger">⚠️ ATENȚIE ⚠️ SE RECOMANDĂ SCHIMBAREA PAROLEI </span>}
      </h3>
      <p><b>Status:</b> {info.status}</p>
      {info.parola && (
        <p>
          <b>Parolă:</b>{' '}
          {visiblePasswords[user] ? info.parola : '•••••••'}
          <img
            src={visiblePasswords[user] ? EyeOff : Eye}
            alt="toggle visibility"
            onClick={() => togglePassword(user)}
            style={{ cursor: 'pointer', marginLeft: '10px', width: '20px', verticalAlign: 'middle' }}
            title={visiblePasswords[user] ? 'Ascunde' : 'Afișează'}
          />
        </p>
      )}
    </div>
  );
})}


      </div>


      {/* CARD 3: Istoric login cu căutare și afișare limitată */}
<div className="info-section">
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
    <h2>
      <img src={History} alt="History" className="section-icon" /> Istoric Login
    </h2>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <input
        type="text"
        placeholder="Caută utilizator/dată..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
        style={{ maxWidth: '250px' }}
      />
     <button
  onClick={() => setShowAll(!showAll)}
  className="expand-btn"
>
  {showAll ? "▲" : "▼"}

</button>

    </div>
  </div>


 <table className="table-no-border">
  <thead>
    <tr>
      <th>Utilizator</th>
      <th>Tip</th>
      <th>Dată</th>
    </tr>
  </thead>
  <tbody>
    {displayedLogins.map((row, i) => {
      const cols = row.trim().split(/\s+/);
      return (
        <tr key={i}>
          <td>{cols[0]}</td>
          <td>
            {cols[1]}
            <p className="small-text">{interpretTerminal(cols[1], cols[0])}</p>
          </td>
          <td>{cols.slice(3).join(' ')}</td>
        </tr>
      );
    })}
  </tbody>
</table>


</div>



             {/* CARD 4: Procese utilizatori */}
             
      <div className="info-section">
        <h2>
          <img src={Padding} alt="Padding" className="section-icon" />Procese utilizatori
        </h2>
        
        {users.map(user => (
  <div className="user-card" key={user.username + '-proc'}>
    <b>{user.username}</b>
    {user.processes.length > 0 ? (
      <ul>
        {user.processes.slice(0, 10).map((proc, idx) => (
          <li key={idx}>{proc}</li>
        ))}
      </ul>
    ) : (
      <p style={{ fontStyle: "italic", color: "gray" }}>Nicio activitate recentă.</p>
    )}
  </div>
))}

      </div>



      {/* CARD 5: Comenzi recente */}
<div className="info-section">
  <h2>
    <img src={Terminal} alt="Terminal" className="section-icon" />Comenzi rulate
  </h2>

  {users.map(user => (
  <div className="user-card" key={user.username + '-cmd'}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <b>{user.username}</b>
      {user.recent_commands.length > 10 && (
        <button className="expand-btn" onClick={() => toggleUserCommands(user.username)}>
          {expandedUsers[user.username] ? "▲" : "▼"}
        </button>
      )}
    </div>

    <ul>
      {(expandedUsers[user.username] ? user.recent_commands : user.recent_commands.slice(0, 10)).map((cmd, idx) => (
        <li key={idx}>{cmd}</li>
      ))}
    </ul>
  </div>
))}

</div>



    </div>
  );
};

export default UserActivity;
