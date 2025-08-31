import React from 'react';
import { WifiOffIcon } from './icons/WifiOffIcon';

export const OfflineIndicator: React.FC = () => {
  return (
    <div 
      className="bg-yellow-900/50 text-yellow-300 text-sm text-center p-2 flex items-center justify-center gap-3 animate-fade-in-up"
      style={{ animationDuration: '0.3s' }}
      role="status"
    >
      <WifiOffIcon className="w-5 h-5" />
      You are currently offline. Functionality is limited.
    </div>
  );
};
