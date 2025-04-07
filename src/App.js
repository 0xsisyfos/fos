import React from 'react';
import './App.css';
import Game from './components/Game';
import { StarknetProvider } from './context/StarknetProvider';

function App() {
  return (
    <StarknetProvider>
      <div className="game-frame">
        <div className="title-bar">
          <div className="title"></div>
          <div className="window-buttons">
            <div className="window-button">─</div>
            <div className="window-button">□</div>
            <div className="window-button">✕</div>
          </div>
        </div>
        <div className="frame-decor"></div>
        <div className="game-container">
          <Game />
        </div>
      </div>
      <div className="attribution">
        credit: original game/concept/art/ by dong nguyen {'\n'}
        fork of {' '}
        <a href="https://github.com/nebez/floppybird/" target="_blank" rel="noopener noreferrer">
          https://github.com/nebez/floppybird/
        </a>
      </div>
    </StarknetProvider>
  );
}

export default App;
