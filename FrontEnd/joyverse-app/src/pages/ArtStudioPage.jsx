import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GameLayout from '../components/GameLayout';
import ArtStudio from '../components/games/ArtStudio';

const ArtStudioPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGameClose = () => {
    navigate('/child-dashboard');
  };

  return (
    <GameLayout title="🎨 Art Studio" onBack={handleGameClose}>
      <div className="h-full w-full">
        <ArtStudio 
          onClose={handleGameClose}
          user={user}
        />
      </div>
    </GameLayout>
  );
};

export default ArtStudioPage;
