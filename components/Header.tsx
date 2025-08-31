import React from 'react';
import { LogoIcon } from './icons/LogoIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenReference: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenReference }) => {
  return (
    <header className="bg-panel border-b border-border sticky top-0 z-10 flex-shrink-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
             <LogoIcon className="w-7 h-7 text-primary" />
            <h1 className="text-xl font-semibold text-text-primary tracking-wide">
              StepSolve
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onOpenReference} 
              className="p-2 rounded-full text-text-secondary hover:bg-border hover:text-text-primary transition-colors"
              aria-label="Open symbol reference"
            >
              <BookOpenIcon className="w-6 h-6" />
            </button>
            <button 
              onClick={onOpenSettings} 
              className="p-2 rounded-full text-text-secondary hover:bg-border hover:text-text-primary transition-colors"
              aria-label="Open settings"
            >
              <SettingsIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
