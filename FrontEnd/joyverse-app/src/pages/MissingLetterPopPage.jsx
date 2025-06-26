import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GameLayout from '../components/GameLayout';
import MissingLetterPop from '../components/games/MissingLetterPop';

const MissingLetterPopPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGameClose = () => {
    navigate('/child-dashboard');
  };

  return (
    <GameLayout title="🔤 Missing Letter Pop" onBack={handleGameClose}>
      <div className="h-full w-full">
        <MissingLetterPop 
          onClose={handleGameClose}
          user={user}
        />
      </div>
    </GameLayout>
  );
};

export default MissingLetterPopPage;
