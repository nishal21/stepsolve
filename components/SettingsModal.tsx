import React, { useState, useEffect } from 'react';
import { XIcon } from './icons/XIcon';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (key: string) => void;
    onReset: () => void;
    currentApiKey: string | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, onReset, currentApiKey }) => {
    const [apiKeyInput, setApiKeyInput] = useState('');

    useEffect(() => {
        if (isOpen) {
            setApiKeyInput(currentApiKey || '');
        }
    }, [isOpen, currentApiKey]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(apiKeyInput);
        onClose();
    };

    const handleReset = () => {
        onReset();
        setApiKeyInput('');
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="settings-title">
            <div className="bg-panel border border-border rounded-xl shadow-2xl max-w-lg w-full p-6 relative animate-fade-in-up" style={{animationDuration: '0.3s'}}>
                <div className="flex justify-between items-center mb-4">
                    <h2 id="settings-title" className="text-xl font-bold text-text-primary">Settings</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary" aria-label="Close settings">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="api-key-input" className="block text-sm font-medium text-text-secondary mb-1">
                            Google AI API Key
                        </label>
                        <input
                            id="api-key-input"
                            type="password"
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                            placeholder="Enter your API key"
                            className="w-full px-3 py-2 font-mono bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition duration-200 text-text-primary"
                        />
                    </div>
                    
                    <div className="text-xs text-text-secondary p-3 bg-background rounded-md border border-border">
                        <p>
                            Your API key is stored securely in your browser's local storage and is never sent to our servers.
                        </p>
                        <p className="mt-2">
                            You can get your own API key from {' '}
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">
                                Google AI Studio
                            </a>.
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
                     <button
                        onClick={handleSave}
                        disabled={!apiKeyInput.trim()}
                        className="w-full sm:w-auto px-6 py-2 bg-primary hover:opacity-90 disabled:bg-border disabled:text-text-secondary disabled:opacity-70 text-white font-bold rounded-lg transition-colors duration-200"
                    >
                        Save
                    </button>
                    <button
                        onClick={handleReset}
                        className="w-full sm:w-auto px-6 py-2 bg-panel hover:bg-border text-text-secondary font-bold rounded-lg transition-colors duration-200 border border-border"
                    >
                        Reset API Key
                    </button>
                </div>
            </div>
        </div>
    );
};