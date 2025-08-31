import React, { useState } from 'react';
import type { HistoryItem } from '../types';
import { HistoryIcon } from './icons/HistoryIcon';
import { ShareIcon } from './icons/ShareIcon';
import { XIcon } from './icons/XIcon';

interface HistorySidebarProps {
  history: HistoryItem[];
  onItemClick: (item: HistoryItem) => void;
  onShareItem: (item: HistoryItem) => void;
  onClear: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onItemClick, onShareItem, onClear }) => {
    const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-4 right-4 z-30 bg-primary text-white p-4 rounded-full shadow-lg animate-fade-in-up"
        style={{ animationDelay: '0.5s', animationFillMode: 'backwards' }}
        aria-label="Toggle History"
      >
        <HistoryIcon className="w-6 h-6" />
      </button>

      <aside className={`transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:relative z-20 w-72 md:w-72 lg:w-80 h-full bg-panel flex flex-col flex-shrink-0 border-r border-border`}>
        <div className="p-4 border-b border-border flex justify-between items-center h-16 flex-shrink-0">
          <h2 className="text-lg font-semibold flex items-center gap-3 text-text-primary">
            <HistoryIcon className="w-5 h-5 text-text-secondary" />
            History
          </h2>
           <button 
                onClick={() => setIsOpen(false)}
                className="md:hidden text-text-secondary p-2 -mr-2"
                aria-label="Close History"
            >
             <XIcon className="w-6 h-6" />
           </button>
        </div>
        
        {history.length > 0 ? (
          <>
            <ul className="flex-grow overflow-y-auto p-2">
              {history.map((item) => (
                <li key={item.id} className="relative group">
                  <button
                    onClick={() => {
                      onItemClick(item);
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-3 my-1 rounded-lg hover:bg-border transition-colors duration-200"
                  >
                    <p className="font-mono truncate text-sm text-text-primary">{item.equation}</p>
                    <p className="text-xs text-text-secondary truncate">
                      {item.result.finalAnswer}
                    </p>
                  </button>
                   <button
                    onClick={() => onShareItem(item)}
                    className="absolute top-1/2 -translate-y-1/2 right-3 p-2 rounded-full text-text-secondary hover:bg-background hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Share calculation"
                  >
                    <ShareIcon className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="p-4 border-t border-border flex-shrink-0">
                <button
                    onClick={onClear}
                    className="w-full text-center px-4 py-2 text-sm font-medium rounded-md text-danger bg-danger-bg hover:border-danger border border-transparent"
                >
                    Clear History
                </button>
            </div>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
            <p className="text-sm text-text-secondary">
              Your calculations will appear here.
            </p>
          </div>
        )}
      </aside>
      
      {isOpen && <div onClick={() => setIsOpen(false)} className="md:hidden fixed inset-0 bg-black/50 z-10"></div>}
    </>
  );
};
