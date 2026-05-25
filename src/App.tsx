import React from 'react';
import { BattleView } from './ui/BattleView';
import { HandArea } from './ui/HandArea';
import { PlayerInfo } from './ui/PlayerInfo';
import { EnemyArea } from './ui/EnemyArea';

const App: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#111',
      color: '#ddd',
      fontFamily: 'sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <PlayerInfo />
      <div style={{ flex: 1 }}>
        <EnemyArea />
        <BattleView />
      </div>
      <HandArea />
    </div>
  );
};

export default App;
