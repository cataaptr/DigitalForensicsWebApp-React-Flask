import React from 'react'
import { Routes, Route } from 'react-router-dom';
import ForensicsDashboard from './Layouts/ForensicsDashboard/ForensicsDashboard.js';
import FileAnalysis from "./Layouts/FileAnalysis/FileAnalysis.js"
import LogsAnalysis from "./Layouts/LogsAnalysis/LogsAnalysis.js"
import NetworkForensics from "./Layouts/NetworkForensics/NetworkForensics.js"
import Report from "./Layouts/Report/Report.js"
import Settings from "./Layouts/Settings/Settings.js"
import SystemAnalysis from "./Layouts/SystemAnalysis/SystemAnalysis.js"
import UserActivity from "./Layouts/UserActivity/UserActivity.js"
import Start from "./Layouts/Start/Start.js"
import Home from "./Layouts/Home/Home.js"

import { SystemProvider } from './SystemContext.js';


function App() {
  return (

    <SystemProvider>
      
   <Routes>
      <Route path="/" element={<Start />} />
      <Route path="/home" element={<Home />} />
     <Route path="/dashboard" element={<ForensicsDashboard />} />
     <Route path="/system-analysis" element={<SystemAnalysis />} />
     <Route path="/user-activity" element={<UserActivity />} />
     <Route path="/file-analysis" element={<FileAnalysis />} />
     <Route path="/logs-events" element={<LogsAnalysis />} />
     <Route path="/network-forensics" element={<NetworkForensics />} />
     <Route path="/report" element={<Report />} />
     <Route path="/settings" element={<Settings />} />
     
    </Routes>
   
   </SystemProvider>
  

  );
}

export default App