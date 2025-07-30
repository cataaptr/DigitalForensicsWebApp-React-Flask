import React, { useState, useContext } from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';
import { SystemContext } from '../../SystemContext.js';
import Lottie from 'lottie-react';
import securityCheckAnim from './../../assets/animation/animation_2.json'; 


const Home = () => {
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setSelectedSnapshotId } = useContext(SystemContext);
  const [showAnimation, setShowAnimation] = useState(false);
  


  // Transformă timestamp în text de tip "acum X minute"
  const getLastSeenText = (timestamp) => {
    const secondsAgo = Math.floor((Date.now() - timestamp * 1000) / 1000);
    if (secondsAgo < 60) return `acum ${secondsAgo} secunde`;
    if (secondsAgo < 3600) return `acum ${Math.floor(secondsAgo / 60)} minute`;  
    return `acum ${Math.floor(secondsAgo / 3600)} ore și ${Math.floor((secondsAgo % 3600) / 60)} minute`;

  };

  // Preia sistemele din backend
 const fetchSystems = async () => {
  setLoading(true);
  try {
    const res = await fetch('/api/snapshots');
    const snapshots = await res.json();

    const systemsWithTimestamps = snapshots.map(sys => {
    const lastSeen = new Date(sys.timestamp + "Z").getTime(); // tratamentul ca UTC
     // milisecunde
  const now = Date.now();
  const secondsAgo = (now - lastSeen) / 1000;
  const online = secondsAgo <= 5 * 60;

  return {
    ...sys,
    online,
    lastSeenText: getLastSeenText(lastSeen / 1000)
  };
});


    setSystems(systemsWithTimestamps);
  } catch (error) {
    console.error('Eroare la preluarea sistemelor:', error);
  } finally {
    setLoading(false);
  }
};


const analyzeSystem = (sys) => {
  setSelectedSnapshotId(sys.id); 
  setShowAnimation(true);

  setTimeout(() => {
    setShowAnimation(false);
    navigate(`/dashboard`);
  }, 3000); // 2 secunde animație
};



  return (
    <div className="home-container">
      <h1>Sisteme</h1>


      {showAnimation && (
  <div className="animation-container">
    <Lottie 
  animationData={securityCheckAnim} 
  loop={false} 
  style={{ width: 200, height: 200 }} 
/>
    <p>Se inițiază analiza sistemului...</p>
  </div>
)}
      {!showAnimation && (
  <button className="start-button" onClick={fetchSystems}>START</button>
)}


      {loading && <p>Se încarcă sistemele...</p>}

   
      {!showAnimation && (
  <div className="systems-list">
    {systems.map((sys, index) => (
      <div key={index} className="system-card">
        <h3>{sys.hostname}</h3>
        <p>{sys.ip}</p>
        <p>Status: {sys.online ? '🟢 Online' : '🔴 Offline'}</p>
        <p>Ultima actualizare: {sys.lastSeenText}</p>
        <button onClick={() => analyzeSystem(sys)}>Analizează</button>
      </div>
    ))}
  </div>
)}


    </div>
  );
};

export default Home;
