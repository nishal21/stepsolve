
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { CalculatorDisplay } from './components/CalculatorDisplay';
import { ExplanationPane } from './components/ExplanationPane';
import { HistorySidebar } from './components/HistorySidebar';
import { SymbolGlossary } from './components/SymbolGlossary';
import { SettingsModal } from './components/SettingsModal';
import { CameraCapture } from './components/CameraCapture';
import { LandingPage } from './components/LandingPage';
import { TermsModal } from './components/TermsModal';
import { PrivacyModal } from './components/PrivacyModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ShareModal } from './components/ShareModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ReferenceModal } from './components/ReferenceModal';
import { explainCalculation } from './services/geminiService';
import { canSolveOffline, solveOffline } from './services/offlineService';
import { fileToBase64, imageUrlToBase64 } from './utils/imageUtils';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import type { HistoryItem, CalculationResponse, ImageData, SymbolDefinition } from './types';

const surpriseEquations = [
  "d/dx(sin(x^2))",
  "integrate(x*e^x, 0, 1)",
  "3x^2 - 5x + 2 = 0",
  "lim(x->0, sin(x)/x)",
  "sum(1/n^2, n=1 to infinity)",
  "f(x) = x^3 - 6x^2 + 11x - 6, find roots",
];

const App: React.FC = () => {
  const [equation, setEquation] = useState<string>('');
  const [currentResult, setCurrentResult] = useState<CalculationResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const savedHistory = localStorage.getItem('calcHistory');
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (e) {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<ImageData | null>(null);
  
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolDefinition | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isLaunched, setIsLaunched] = useState<boolean>(false);
  const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [itemToShare, setItemToShare] = useState<HistoryItem | null>(null);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState<boolean>(false);
  const [isReferenceOpen, setIsReferenceOpen] = useState<boolean>(false);

  const calculationIdRef = useRef(0);
  const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem('geminiApiKey'));
  const isOnline = useOnlineStatus();

  useEffect(() => {
    localStorage.setItem('calcHistory', JSON.stringify(history));
  }, [history]);
  
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      try {
        const jsonString = atob(decodeURIComponent(hash));
        const compactItem = JSON.parse(jsonString);

        // Decompress from compact format
        const sharedItem: HistoryItem = {
            id: Date.now(),
            equation: compactItem.e,
            result: {
                finalAnswer: compactItem.r.f,
                steps: compactItem.r.s.map((step: any) => ({
                    expression: step.x,
                    explanation: step.p,
                    rule: step.l,
                })),
                symbols: compactItem.r.y.map((symbol: any) => ({
                    symbol: symbol.b,
                    name: symbol.n,
                    meaning: symbol.m,
                })),
                detectedEquation: compactItem.r.d,
            },
            image: compactItem.i ? { mimeType: compactItem.i.t, data: compactItem.i.d } : undefined,
        };

        if (sharedItem && sharedItem.equation && sharedItem.result) {
          setEquation(sharedItem.equation);
          setCurrentResult(sharedItem.result);
          setImage(sharedItem.image || null);
          setIsLaunched(true);
          window.location.hash = ''; // Clear hash after loading
        }
      } catch (e) {
        console.error("Failed to load shared calculation:", e);
        window.location.hash = ''; // Clear invalid hash
      }
    }
  }, []);

  const handleCalculate = useCallback(async () => {
    const problem = equation;
    if (!problem.trim() && !image) return;

    calculationIdRef.current += 1;
    const currentCalculationId = calculationIdRef.current;

    setIsLoading(true);
    setError(null);
    setCurrentResult(null);

    try {
        let response: CalculationResponse;
        const isOfflineSolvable = canSolveOffline(problem);

        if (!isOnline || (isOfflineSolvable && !image)) {
           try {
             response = solveOffline(problem);
           } catch (offlineError) {
              if(!isOnline) {
                throw offlineError; // If offline and it fails, it's a hard error
              }
              // If online but offline failed, fall through to Gemini
              console.warn("Offline solver failed, trying online:", offlineError);
              if (!apiKey) throw new Error("Please set your API key in settings to solve this problem.");
              response = await explainCalculation(problem, apiKey, image ?? undefined);
           }
        } else {
            if (!apiKey) throw new Error("You are online, but an API key is required. Please set it in the settings.");
            response = await explainCalculation(problem, apiKey, image ?? undefined);
        }

        if (currentCalculationId === calculationIdRef.current) {
            if (response.error) {
              throw new Error(response.error);
            }
          
            setCurrentResult(response);
          
            if (response.finalAnswer) {
                 const newHistoryItem: HistoryItem = {
                    id: Date.now(),
                    equation: response.detectedEquation || problem,
                    result: response,
                    image: image || undefined,
                };
                setHistory(prev => [newHistoryItem, ...prev.filter(h => h.equation !== newHistoryItem.equation)]);
            }
           if (response.detectedEquation) {
             setEquation(response.detectedEquation);
           }
        }

    } catch (err) {
        if (currentCalculationId === calculationIdRef.current) {
            const message = (err instanceof Error) ? err.message : 'An unknown error occurred.';
            setError(message);
        }
    } finally {
        if (currentCalculationId === calculationIdRef.current) {
            setIsLoading(false);
        }
    }
  }, [equation, image, apiKey, isOnline]);

  const handleHistoryClick = (item: HistoryItem) => {
    // Invalidate any ongoing calculation by incrementing the ref
    calculationIdRef.current += 1;
    setIsLoading(false); // Ensure loading state is reset

    setEquation(item.equation);
    setCurrentResult(item.result);
    setImage(item.image || null);
    setError(null);
  };

  const handleClearHistory = () => {
    setIsConfirmClearOpen(true);
  };
  
  const handleConfirmClear = () => {
    setHistory([]);
    setIsConfirmClearOpen(false);
  };

  const handleImageUpload = async (file: File) => {
    setError(null);
    try {
      const imageData = await fileToBase64(file);
      setImage(imageData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file.');
    }
  };
  
  const handleImageUrlSubmit = async (url: string) => {
    setError(null);
    try {
      const imageData = await imageUrlToBase64(url);
      setImage(imageData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load image from URL.');
    }
  }

  const handleCameraCapture = (imageData: ImageData) => {
    setImage(imageData);
    setIsCameraOpen(false);
  };
  
  const handleSaveSettings = (key: string) => {
      setApiKey(key);
      localStorage.setItem('geminiApiKey', key);
  }
  
  const handleResetSettings = () => {
      setApiKey(null);
      localStorage.removeItem('geminiApiKey');
  }

  const handleSurpriseMe = () => {
    const randomEquation = surpriseEquations[Math.floor(Math.random() * surpriseEquations.length)];
    setEquation(randomEquation);
    setImage(null);
  };
  
  const handleOpenShareModal = (item: HistoryItem) => {
    setItemToShare(item);
  };
  
  return (
    <>
      {!isLaunched ? (
        <LandingPage onLaunch={() => setIsLaunched(true)} onShowTerms={() => setIsTermsOpen(true)} onShowPrivacy={() => setIsPrivacyOpen(true)} />
      ) : (
        <div className="min-h-screen bg-background font-sans text-text-primary flex flex-col">
          <Header onOpenSettings={() => setIsSettingsOpen(true)} onOpenReference={() => setIsReferenceOpen(true)} />
          {!isOnline && <OfflineIndicator />}
          <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
            <HistorySidebar 
                history={history} 
                onItemClick={handleHistoryClick} 
                onClear={handleClearHistory} 
                onShareItem={handleOpenShareModal} 
                isLoading={isLoading} 
            />
            <main className="flex-grow flex flex-col p-4 sm:p-6 overflow-hidden">
              <CalculatorDisplay
                equation={equation}
                onEquationChange={setEquation}
                onCalculate={handleCalculate}
                onSurpriseMe={handleSurpriseMe}
                isLoading={isLoading}
                image={image}
                onImageUpload={handleImageUpload}
                onImageUrlSubmit={handleImageUrlSubmit}
                onClearImage={() => setImage(null)}
                onOpenCamera={() => setIsCameraOpen(true)}
              />

              <div className="flex-grow mt-4 sm:mt-6 bg-panel rounded-lg border border-border overflow-hidden flex flex-col">
                <ExplanationPane 
                    result={currentResult}
                    isLoading={isLoading}
                    error={error}
                    onSymbolClick={setSelectedSymbol}
                />
              </div>
            </main>
          </div>
        </div>
      )}

      {selectedSymbol && <SymbolGlossary symbolDef={selectedSymbol} onClose={() => setSelectedSymbol(null)} />}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onSave={handleSaveSettings}
        onReset={handleResetSettings}
        currentApiKey={apiKey}
      />
      {isCameraOpen && <CameraCapture onCapture={handleCameraCapture} onClose={() => setIsCameraOpen(false)} />}
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      {itemToShare && <ShareModal item={itemToShare} onClose={() => setItemToShare(null)} />}
      <ConfirmModal 
        isOpen={isConfirmClearOpen}
        onClose={() => setIsConfirmClearOpen(false)}
        onConfirm={handleConfirmClear}
        title="Clear All History"
        message="Are you sure you want to clear all history? This action cannot be undone."
        confirmText="Clear"
        cancelText="Cancel"
      />
      <ReferenceModal isOpen={isReferenceOpen} onClose={() => setIsReferenceOpen(false)} />
    </>
  );
};

export default App;
