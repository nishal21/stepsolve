import React, { useRef, useState } from 'react';
import type { ImageData } from '../types';
import { CameraIcon } from './icons/CameraIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { LinkIcon } from './icons/LinkIcon';
import { WandIcon } from './icons/WandIcon';


interface CalculatorDisplayProps {
  equation: string;
  onEquationChange: (value: string) => void;
  onCalculate: () => void;
  onSurpriseMe: () => void;
  isLoading: boolean;
  image: ImageData | null;
  onImageUpload: (file: File) => void;
  onImageUrlSubmit: (url: string) => void;
  onClearImage: () => void;
  onOpenCamera: () => void;
}

const IconButton: React.FC<{onClick: () => void, disabled: boolean, children: React.ReactNode, label: string}> = ({ onClick, disabled, children, label }) => (
  <button 
    onClick={onClick} 
    className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-md text-text-secondary bg-panel hover:bg-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
    disabled={disabled}
    aria-label={label}
  >
    {children}
    <span className="hidden sm:inline">{label}</span>
  </button>
);


export const CalculatorDisplay: React.FC<CalculatorDisplayProps> = ({ 
  equation, 
  onEquationChange, 
  onCalculate,
  onSurpriseMe,
  isLoading,
  image,
  onImageUpload,
  onImageUrlSubmit,
  onClearImage,
  onOpenCamera 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUrlInputVisible, setIsUrlInputVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isLoading) {
      event.preventDefault();
      onCalculate();
    }
  };
  
  const handleUrlKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isLoading) {
      handleUrlSubmit();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };
  
  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      onImageUrlSubmit(imageUrl);
      setIsUrlInputVisible(false);
      setImageUrl('');
    }
  }
  
  return (
    <div className="bg-panel p-4 sm:p-5 rounded-lg border border-border animate-fade-in-up flex-shrink-0">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <input
          id="equation-input"
          type="text"
          value={equation}
          onChange={(e) => onEquationChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a math problem..."
          className="flex-grow w-full px-2 py-3 text-xl sm:text-2xl font-mono bg-transparent focus:ring-0 focus:outline-none transition duration-200 text-text-primary placeholder-text-secondary"
          disabled={isLoading}
          aria-label="Math problem input"
        />
        <button
          onClick={onCalculate}
          disabled={isLoading || (!equation && !image)}
          className="w-full sm:w-auto px-8 py-3 bg-primary hover:opacity-90 disabled:bg-border disabled:text-text-secondary disabled:opacity-70 text-white font-bold rounded-lg transition-all duration-200 transform disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Thinking...
            </>
          ) : (
            'Calculate'
          )}
        </button>
      </div>

       <div className="mt-4 pt-4 border-t border-border">
        {image ? (
          <div className="relative group w-full sm:w-1/2 md:w-1/3">
            <img 
              src={`data:${image.mimeType};base64,${image.data}`} 
              alt="Equation preview" 
              className="rounded-lg w-full h-auto object-contain border-2 border-border" 
            />
            <button
              onClick={onClearImage}
              className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
              aria-label="Remove image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center flex-wrap gap-3">
               <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              <IconButton onClick={() => fileInputRef.current?.click()} disabled={isLoading} label="Upload">
                <PaperclipIcon className="w-5 h-5" />
              </IconButton>
               <IconButton onClick={onOpenCamera} disabled={isLoading} label="Camera">
                <CameraIcon className="w-5 h-5" />
              </IconButton>
               <IconButton onClick={() => setIsUrlInputVisible(!isUrlInputVisible)} disabled={isLoading} label="URL">
                <LinkIcon className="w-5 h-5" />
              </IconButton>
               <IconButton onClick={onSurpriseMe} disabled={isLoading} label="Surprise Me">
                <WandIcon className="w-5 h-5" />
              </IconButton>
            </div>
             {isUrlInputVisible && (
              <div className="flex gap-2 mt-3" style={{animation: 'fade-in-up 0.3s ease-out forwards'}}>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyDown={handleUrlKeyDown}
                  placeholder="Paste image link here..."
                  className="flex-grow w-full px-3 py-2 text-sm bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition duration-200 text-text-primary placeholder-text-secondary"
                  disabled={isLoading}
                />
                <button onClick={handleUrlSubmit} className="px-4 py-2 bg-border hover:bg-opacity-80 text-text-primary text-sm font-bold rounded-lg" disabled={isLoading || !imageUrl.trim()}>
                  Load
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};