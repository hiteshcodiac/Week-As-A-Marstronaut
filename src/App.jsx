import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import MarsScene from './levels/Mars/Mars.jsx';
import OutpostScene from './levels/Outpost/Outpost.jsx';
import './App.css';

function App() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    // Avoid double instantiation in React StrictMode
    if (!container || gameRef.current) return;

    // Clear any previous canvas nodes
    container.innerHTML = '';

    const config = {
      type: Phaser.AUTO,
      parent: container,
      width: window.innerWidth,
      height: window.innerHeight,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: '100%',
        height: '100%',
      },
      render: {
        antialias: true,
        pixelArt: false,
        powerPreference: 'high-performance',
      },
      scene: [MarsScene, OutpostScene],
      backgroundColor: '#030408',
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return <div ref={containerRef} className="game-container" id="phaser-game-container" />;
}

export default App;
