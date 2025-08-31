import React, { useState, useEffect } from 'react';
import { useMathJax } from '../hooks/useMathJax';
import { XIcon } from './icons/XIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface AnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAnalyze: (userAnswer: string) => Promise<void>;
    problem: string;
    correctAnswer: string;
    analysisResult: string | null;
    isAnalyzing: boolean;
    clearAnalysis: () => void;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ 
    isOpen, 
    onClose,
    onAnalyze,
    problem,
    correctAnswer,
    analysisResult,
    isAnalyzing,
    clearAnalysis
}) => {
    const [userAnswer, setUserAnswer] = useState('');
    const mathJaxRef = useMathJax([correctAnswer, analysisResult]);

    useEffect(() => {
        if (isOpen) {
            setUserAnswer('');
            clearAnalysis();
        }
    }, [isOpen, clearAnalysis]);

    if (!isOpen) return null;

    const handleAnalyzeClick = () => {
        if(userAnswer.trim()){
            onAnalyze(userAnswer);
        }
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey && !isAnalyzing) {
          event.preventDefault();
          handleAnalyzeClick();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="analysis-title">
            <div ref={mathJaxRef} className="bg-panel border border-border rounded-xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 id="analysis-title" className="text-xl font-bold text-text-primary">Analyze Your Answer</h2>
                        <p className="text-sm text-text-secondary mt-1">Comparing your work on: <span className="font-mono text-text-primary">{problem}</span></p>
                    </div>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary" aria-label="Close analysis">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Correct Answer Display */}
                    <div className="p-4 bg-background rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                           <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                           <label className="block text-sm font-medium text-text-secondary">Correct Answer</label>
                        </div>
                        <div className="mt-2 pl-8 text-lg font-mono text-text-primary overflow-x-auto">
                           ${correctAnswer}$
                        </div>
                    </div>

                    {/* User Answer Input */}
                    <div className="p-4 bg-background rounded-lg border-2 border-border focus-within:border-primary transition-colors">
                        <div className="flex items-center gap-3">
                           <XCircleIcon className="w-5 h-5 text-danger flex-shrink-0" />
                           <label htmlFor="user-answer-input" className="block text-sm font-medium text-text-secondary">Your Answer</label>
                        </div>
                        <textarea
                            id="user-answer-input"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your final answer here..."
                            rows={2}
                            className="w-full mt-2 pl-8 bg-transparent font-mono text-lg text-text-primary focus:outline-none resize-none"
                            disabled={isAnalyzing}
                        />
                    </div>
                </div>

                {/* Analysis Result */}
                {isAnalyzing && (
                    <div className="mt-6 text-center text-text-secondary flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse-fast" style={{animationDelay: '0s'}}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse-fast" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse-fast" style={{animationDelay: '0.4s'}}></div>
                        <p>Tutor is thinking...</p>
                    </div>
                )}
                {analysisResult && (
                    <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/30 animate-fade-in-up">
                         <h3 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
                            <SparklesIcon className="w-5 h-5 text-primary"/>
                            Tutor's Feedback
                         </h3>
                        <p className="text-text-secondary">{analysisResult}</p>
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleAnalyzeClick}
                        disabled={!userAnswer.trim() || isAnalyzing}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-primary hover:opacity-90 disabled:bg-border disabled:text-text-secondary disabled:opacity-70 text-white font-bold rounded-lg transition-colors duration-200"
                    >
                        {isAnalyzing ? (
                            <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analyzing...
                            </>
                        ) : (
                             <>
                                <SparklesIcon className="w-5 h-5"/>
                                Analyze
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};