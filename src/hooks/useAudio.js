import { useCallback, useRef } from 'react';

const AUDIO = {
  create: (src) => {
    const audio = new Audio(src);
    audio.preload = 'auto';
    return audio;
  },
  sounds: {
    wing: new Audio('/assets/sounds/sfx_wing.ogg'),
    hit: new Audio('/assets/sounds/sfx_hit.ogg'),
    point: new Audio('/assets/sounds/sfx_point.ogg'),
    swooshing: new Audio('/assets/sounds/sfx_swooshing.ogg'),
    die: new Audio('/assets/sounds/sfx_die.ogg')
  },
  play: (sound) => {
    try {
      // Reset the audio to the beginning
      sound.currentTime = 0;
      
      // Create a promise to handle the play request
      const playPromise = sound.play();
      
      // Handle the promise rejection (which happens when play is interrupted)
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Audio play interrupted
        });
      }
    } catch (error) {
      // Error playing sound
    }
  },
  loadAll: () => {
    Object.values(AUDIO.sounds).forEach(sound => {
      try {
        sound.load();
      } catch (error) {
        // Error loading sound
      }
    });
  }
};

export const useAudio = () => {
  const playSound = useCallback((soundName) => {
    const sound = AUDIO.sounds[soundName];
    if (sound) {
      AUDIO.play(sound);
    }
  }, []);

  const loadSounds = useCallback(() => {
    AUDIO.loadAll();
  }, []);

  const play = useCallback((soundName) => {
    if (!AUDIO.sounds[soundName]) return;

    try {
      AUDIO.sounds[soundName].play();
    } catch (error) {
      // Error playing sound
    }
  }, []);

  const loadSound = useCallback((soundName, soundFile) => {
    try {
      const audio = new Audio(soundFile);
      audio.load();
      AUDIO.sounds[soundName] = audio;
    } catch (error) {
      // Error loading sound
    }
  }, []);

  return {
    playSound,
    loadSounds,
    play,
    loadSound
  };
}; 