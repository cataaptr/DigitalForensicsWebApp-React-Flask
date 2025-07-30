import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Start.css';
import StartIcon from "../../assets/icons/troubleshoot_green.svg"


const Welcome = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/home'); 
  };

  return (
    <div className="start-container">
      <h1 className="app-title">
           <img src={StartIcon} alt="StartIcon" />Aplicație digital forensics pentru sistemele Linux
      </h1>
        <p>Investighează în profunzime sistemele Linux din rețea cu ajutorul unei platforme forensice moderne, rapide și intuitive. Aceasta oferă instrumente dedicate experților în securitate cibernetică, investigatori și analiști:</p>
      <ul>
        <li>Informații sistem</li>
        <li>Informații activitate utilizatori</li>
        <li>Analiză fișiere</li>
        <li>Analiză loguri</li>
         <li>Analiză rețea</li>
        <li>Generare rapoarte</li>
      </ul>
      <button className="start-button" onClick={handleStart}>START</button>
    </div>
  );
};

export default Welcome;
