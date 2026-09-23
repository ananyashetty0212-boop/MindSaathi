import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { speech } from '../../services/speechService';

export const AudioSpeakButton = ({ text, label = 'Listen', size = 'medium', className = '' }) => {
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (speaking) {
      speech.cancel();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      speech.speak(text).then(() => setSpeaking(false));
    }
  };

  const isSmall = size === 'small';

  return (
    <button
      type="button"
      onClick={handleSpeak}
      className={`control-btn ${speaking ? 'active' : ''} ${className}`}
      style={{
        padding: isSmall ? '0.35rem 0.75rem' : '0.6rem 1.2rem',
        fontSize: isSmall ? '0.85rem' : '1.05rem',
        borderRadius: '9999px'
      }}
      aria-label={`Listen to: ${text}`}
      title={speaking ? 'Stop speaking' : 'Read aloud with gentle voice'}
    >
      {speaking ? <VolumeX size={isSmall ? 16 : 20} /> : <Volume2 size={isSmall ? 16 : 20} />}
      <span>{speaking ? 'Stop Voice' : label}</span>
    </button>
  );
};

export default AudioSpeakButton;
