import React, { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { BattleScreen } from './ui/BattleScreen';
import { MapView } from './ui/MapView';
import { EventView } from './ui/EventView';
import { ShopView } from './ui/ShopView';

const App: React.FC = () => {
  const phase = useGameStore(s => s.runState?.phase ?? 'map');
  const initRun = useGameStore(s => s.initRun);

  useEffect(() => {
    initRun(['strike', 'strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'quick_thought']);
  }, []);

  switch (phase) {
    case 'battle':
    case 'battle_victory':
    case 'battle_defeat':
      return <BattleScreen />;
    case 'shop':
      return <ShopView />;
    case 'event':
      return <EventView />;
    case 'map':
    default:
      return <MapView />;
  }
};

export default App;
