import { createContext, useState, useEffect } from 'react';

export const SystemContext = createContext();

export const SystemProvider = ({ children }) => {
  const [selectedSnapshotId, setSelectedSnapshotId] = useState(() => {
    return localStorage.getItem('selectedSnapshotId') || null;
  });

  useEffect(() => {
    if (selectedSnapshotId) {
      localStorage.setItem('selectedSnapshotId', selectedSnapshotId);
    }
  }, [selectedSnapshotId]);

  return (
    <SystemContext.Provider value={{ selectedSnapshotId, setSelectedSnapshotId }}>
      {children}
    </SystemContext.Provider>
  );
};
