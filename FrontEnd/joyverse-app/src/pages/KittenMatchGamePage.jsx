import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GameLayout from '../components/GameLayout';
import KittenMatchGame from '../components/games/KittenMatchGame';

const KittenMatchGamePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGameClose = () => {
    navigate('/child-dashboard');
  };

  return (
    <GameLayout title="🐱 Kitten Memory Match" onBack={handleGameClose}>
      <div className="h-full w-full">
        <KittenMatchGame 
          onClose={handleGameClose}
          user={user}
        />
      </div>
    </GameLayout>
  );
};

export default KittenMatchGamePage;
