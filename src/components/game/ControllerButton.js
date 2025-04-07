import React, { useState } from 'react';
import { sharedButtonStyle, sharedOverlayStyle, sharedPopupStyle } from './sharedStyles';

const ControllerButton = ({ 
  connected, 
  username, 
  handleControllerClick 
}) => {
  const [showPopup, setShowPopup] = useState(false);

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '2px solid #2c3e50'
  };

  const titleStyle = {
    margin: 0,
    color: '#2c3e50',
    fontSize: '12px',
    textShadow: '2px 2px 0 rgba(0,0,0,0.2)'
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#2c3e50',
    padding: '4px 8px',
    lineHeight: 1,
    fontFamily: "'Press Start 2P', cursive",
    textShadow: '1px 1px 0 rgba(0,0,0,0.2)'
  };

  const contentStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontSize: '8px',
    color: '#2c3e50',
    textShadow: '1px 1px 0 rgba(0,0,0,0.1)'
  };

  return (
    <>
      <button
        onClick={handleControllerClick}
        style={{
          ...sharedButtonStyle,
          top: '10px',
          backgroundColor: connected ? '#4CAF50' : '#f44336'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translate(1px, 1px)';
          e.currentTarget.style.boxShadow = '1px 1px 0 #34495e';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translate(0, 0)';
          e.currentTarget.style.boxShadow = '2px 2px 0 #34495e';
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'translate(2px, 2px)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'translate(1px, 1px)';
          e.currentTarget.style.boxShadow = '1px 1px 0 #34495e';
        }}
      >
        {connected ? (username || 'Connected') : 'Connect Controller'}
      </button>
      {showPopup && (
        <div style={sharedOverlayStyle}>
          <div style={sharedPopupStyle}>
            <div style={headerStyle}>
              <h2 style={titleStyle}>Controller Status</h2>
              <button 
                style={closeButtonStyle}
                onClick={() => setShowPopup(false)}
              >
                ×
              </button>
            </div>
            <div style={contentStyle}>
              <p>Status: {connected ? 'Connected' : 'Disconnected'}</p>
              {connected && username && <p>Username: {username}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ControllerButton; 