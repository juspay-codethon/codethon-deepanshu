'use client';

import React from 'react';
import { Html } from '@react-three/drei';

export const Loader: React.FC<{ message?: string }> = ({ message = "Loading..." }) => {
  // This Loader is intended to be used as a Suspense fallback INSIDE the R3F Canvas
  return (
    <Html center fullscreen>
      <div style={{
        // position: 'absolute', // No longer needed with Html fullscreen
        // top: 0,
        // left: 0,
        width: '100vw', // Ensure it covers the viewport if Html is fullscreen
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#111827', // Fully opaque, matching FullPageLoader's dark theme
        color: 'white',
        // zIndex: 100, // Html component handles layering within canvas
        fontFamily: 'monospace',
      }}>
        <div style={{
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          width: '50px', // Slightly larger
          height: '50px', // Slightly larger
          animation: 'spin 1s linear infinite',
        }}></div>
        <p style={{ marginTop: '20px', fontSize: '1.3em' }}>{message}</p>
        {/* Global styles are fine here as Html component isolates them */}
        <style jsx global>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </Html>
  );
};

// Removed duplicate FullPageLoader definition. The one below is the intended one.

export const FullPageLoader: React.FC<{ message?: string }> = ({ message = "Initializing Game..." }) => {
  // This loader is intended to be used at the root of the page,
  // outside the R3F Canvas, for initial page/JS loading.
  return (
    <div style={{
      position: 'fixed', // Use fixed to cover the whole viewport
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#111827', // Dark background
      color: 'white',
      zIndex: 9999, 
      fontFamily: 'monospace',
    }}>
      <div style={{
        border: '5px solid #4A4A4A', // Darker border
        borderTop: '5px solid #60A5FA', // Blue accent
        borderRadius: '50%',
        width: '60px',
        height: '60px',
        animation: 'spin 1.2s linear infinite',
      }}></div>
      <p style={{ marginTop: '25px', fontSize: '1.5em', color: '#E5E7EB' }}>{message}</p>
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
