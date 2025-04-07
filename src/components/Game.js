import React, { useEffect, useState, useCallback } from 'react';
import './Game.css';
import { useConnect, useDisconnect, useAccount } from '@starknet-react/core';
import ControllerConnector from '@cartridge/connector/controller';

import GameBoard from './game/GameBoard';
import ScoreBoard from './game/ScoreBoard';
import ControllerButton from './game/ControllerButton';
import Leaderboard from './game/Leaderboard';
import { useGameContract } from '../hooks/useGameContract';
import { useGameState } from '../hooks/useGameState';
import { useAudio } from '../hooks/useAudio';

// Game states
const GAME_STATES = {
  SplashScreen: 0,
  GameScreen: 1,
  ScoreScreen: 2
};

// Game configuration
const GAME_CONFIG = {
  GRAVITY: 0.25,
  JUMP_AMOUNT: -4.6,
  PIPE_WIDTH: 52,
  PIPE_SPACING: 1500,
  PIPE_SPEED: 3,
  PIPE_GAP: 90,
  BIRD_WIDTH: 34,
  BIRD_HEIGHT: 24,
  GROUND_HEIGHT: 112,
  GAME_WIDTH: 400
};

const Game = () => {
  // Wallet state
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, account } = useAccount();
  const [username, setUsername] = useState();
  const [connected, setConnected] = useState(false);
  const [highScore, setHighScore] = useState(0);

  // Initialize hooks
  const { playSound, loadSounds } = useAudio();
  const { startNewGame, incrementScore, endGame, getHighScore, getLeaderboard } = useGameContract(connected, account);
  const {
    playerRef,
    flyareaRef,
    currentState,
    score,
    pipes,
    showScoreboard,
    showReplay,
    splashOpacity,
    startGame,
    playerJump,
    handleReplayClick,
    showSplash,
    cleanup,
    gameOverInProgressRef
  } = useGameState(GAME_CONFIG, { play: playSound }, incrementScore, endGame, startNewGame);

  // Load high score
  useEffect(() => {
    if (address) {
      const loadHighScore = async () => {
        const score = await getHighScore(address);
        setHighScore(score);
      };
      loadHighScore();
    }
  }, [address, getHighScore]);

  // Controller connection
  useEffect(() => {
    if (!address) return;
    const controller = connectors.find(c => c instanceof ControllerConnector);
    if (controller) {
      controller.username()?.then((n) => setUsername(n));
      setConnected(true);
    }
  }, [address, connectors]);

  // Initialize game
  useEffect(() => {
    loadSounds();
    showSplash();

    return () => {
      cleanup();
    };
  }, []);

  // Event handlers
  const handleKeyPress = useCallback((e) => {
    if (e.code === 'Space') {
      e.preventDefault(); // Prevent space from triggering click
      if (currentState === GAME_STATES.GameScreen) {
        playerJump();
      } else if (currentState === GAME_STATES.SplashScreen) {
        startGame();
      } else if (currentState === GAME_STATES.ScoreScreen) {
        handleReplayClick();
      }
    }
  }, [currentState, playerJump, startGame, handleReplayClick]);

  const handleClick = useCallback((e) => {
    // Ignore clicks if they were triggered by a keyboard event
    if (e.detail === 0) return;
    
    // Check if the click was on any UI element that should not start the game
    const target = e.target;
    if (
      target.id === 'leaderboard-button' ||
      target.closest('[style*="background-color: rgba(0, 0, 0, 0.7)"]') ||
      target.closest('[style*="background-color: #4ec0ca"]') ||
      target.closest('button')?.className === 'close-button'
    ) {
      e.stopPropagation();
      return;
    }
    
    // Only handle game-related clicks if we're in the correct state
    if (currentState === GAME_STATES.GameScreen) {
      playerJump();
    } else if (currentState === GAME_STATES.SplashScreen) {
      // Only start game if we're not in the process of showing the splash screen
      // and the splash screen is fully visible
      if (splashOpacity === 1 && !gameOverInProgressRef.current) {
        startGame();
      }
    } else if (currentState === GAME_STATES.ScoreScreen) {
      handleReplayClick();
    }
  }, [currentState, playerJump, startGame, handleReplayClick, splashOpacity]);

  // Event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('click', handleClick);
    };
  }, [handleKeyPress, handleClick]);

  // Score management
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore]);

  // Controller connection
  const handleControllerClick = async (e) => {
    e.stopPropagation();
    try {
      if (address) {
        await disconnect();
        setConnected(false);
        setUsername(undefined);
      } else {
        const controller = connectors.find(c => c instanceof ControllerConnector);
        if (!controller) {
          throw new Error('Controller connector not found');
        }
        await connect({ connector: controller });
        setConnected(true);
      }
    } catch (error) {
      console.error('Controller connection error:', error);
    }
  };

  // Render
  return (
    <div id="gamecontainer" className={currentState === GAME_STATES.ScoreScreen ? 'dead' : ''}>
      <div id="gamescreen">
        <ControllerButton
          connected={connected}
          username={username}
          handleControllerClick={handleControllerClick}
        />
        <div id="sky" className="animated" />
        <div id="land" className="animated" />
        <GameBoard
          playerRef={playerRef}
          flyareaRef={flyareaRef}
          pipes={pipes}
          score={score}
          currentState={currentState}
          GAME_CONFIG={GAME_CONFIG}
        />
        <div id="splash" style={{ opacity: splashOpacity }} />
        <ScoreBoard
          showScoreboard={showScoreboard}
          showReplay={showReplay}
          score={score}
          highScore={highScore}
          handleReplayClick={handleReplayClick}
          address={address}
          getLeaderboard={getLeaderboard}
        />
        <Leaderboard
          getLeaderboard={getLeaderboard}
          currentState={currentState}
          GAME_STATES={GAME_STATES}
        />
      </div>
    </div>
  );
};

export default Game; 