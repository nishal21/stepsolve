import React, { useState, useEffect, useRef } from 'react';
import type { CalculationResponse, SymbolDefinition } from '../types';
import { useMathJax } from '../hooks/useMathJax';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { PlayIcon } from './icons/PlayIcon';
import { StopIcon } from './icons/StopIcon';

interface ExplanationPaneProps {
  result: CalculationResponse | null;
  isLoading: boolean;
  error: string | null;
  onSymbolClick: (symbol: SymbolDefinition) => void;
}

export const ExplanationPane: React.FC<ExplanationPaneProps> = ({ result, isLoading, error, onSymbolClick }) => {
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
  const [copiedStepIndex, setCopiedStepIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animatedStepIndex, setAnimatedStepIndex] = useState<number | null>(null);

  const mathJaxRef = useMathJax([result, isLoading, error]);
  const animationTimerRef = useRef<number | null>(null);
  const activeStepRef = useRef<HTMLLIElement | null>(null);

  const handleStopAnimation = () => {
    setIsAnimating(false);
    setAnimatedStepIndex(null);
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
    }
  };

  // Stop animation if result changes
  useEffect(() => {
    handleStopAnimation();
    setExpandedSteps({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  // Animation logic
  useEffect(() => {
    // Clear any existing timer
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
    }

    if (isAnimating && animatedStepIndex !== null && result) {
      // Scroll the current step into view
      activeStepRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      
      // Expand the current step
      setExpandedSteps(prev => ({ ...prev, [animatedStepIndex]: true }));
      
      // Set a timer for the next step
      animationTimerRef.current = window.setTimeout(() => {
        if (animatedStepIndex < result.steps.length - 1) {
          setAnimatedStepIndex(animatedStepIndex + 1);
        } else {
          // End of animation
          handleStopAnimation();
        }
      }, 2000); // 2 seconds per step
    }

    // Cleanup on unmount or if dependencies change
    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnimating, animatedStepIndex, result]);


  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center text-center p-8">
        <div className="space-y-3">
            <div className="w-4 h-4 bg-primary rounded-full animate-pulse-fast mx-auto" style={{animationDelay: '0s'}}></div>
            <p className="text-text-secondary">AI is thinking...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex items-center justify-center text-center p-8">
        <div className="bg-danger-bg text-danger p-4 rounded-lg border border-danger max-w-md">
          <h3 className="font-bold mb-2">Calculation Error</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
          <h2 className="text-lg font-semibold text-text-primary mb-2">Welcome to StepSolve</h2>
          <p className="text-text-secondary max-w-sm">Enter a problem, upload an image, or select a calculation from your history to get started.</p>
      </div>
    );
  }

  const toggleStep = (index: number) => {
    if (isAnimating) return;
    setExpandedSteps(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleCopyStep = (expression: string, index: number) => {
    navigator.clipboard.writeText(expression).then(() => {
        setCopiedStepIndex(index);
        setTimeout(() => setCopiedStepIndex(null), 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
  };

  const expandAll = () => {
    if (isAnimating) return;
    const allExpanded = result.steps.reduce((acc, _, index) => {
      acc[index] = true;
      return acc;
    }, {} as Record<number, boolean>);
    setExpandedSteps(allExpanded);
  };

  const collapseAll = () => {
    if (isAnimating) return;
    setExpandedSteps({});
  };
  
  const handlePlayAnimation = () => {
    if (!result || result.steps.length === 0) return;
    collapseAll();
    setIsAnimating(true);
    setAnimatedStepIndex(0);
  };

  return (
    <div ref={mathJaxRef} className="flex-grow animate-fade-in-up flex flex-col overflow-hidden">
        <div className="p-4 sm:p-6 bg-panel border-b border-border flex-shrink-0">
            <div>
                <h2 className="text-sm font-semibold uppercase text-text-secondary tracking-wider">Final Answer</h2>
                <div id="final-answer" className="text-2xl sm:text-3xl font-mono text-primary mt-1 overflow-x-auto">
                    ${result.finalAnswer}$
                </div>
            </div>
        </div>

        <div className="p-4 sm:p-6 flex-grow overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold uppercase text-text-secondary tracking-wider">Step-by-Step Solution</h2>
            {result.steps.length > 1 && (
                <div className="flex gap-2 sm:gap-4 items-center">
                  {isAnimating ? (
                      <button onClick={handleStopAnimation} className="flex items-center gap-1.5 text-xs font-medium text-danger hover:opacity-80 transition-opacity p-1.5 rounded-md bg-danger-bg">
                          <StopIcon className="w-4 h-4" />
                          <span className="hidden sm:inline">Stop</span>
                      </button>
                  ) : (
                      <button onClick={handlePlayAnimation} className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors p-1.5 rounded-md hover:bg-border">
                          <PlayIcon className="w-4 h-4" />
                          <span className="hidden sm:inline">Animate</span>
                      </button>
                  )}
                  <button onClick={expandAll} className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50" disabled={isAnimating}>Expand All</button>
                  <button onClick={collapseAll} className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50" disabled={isAnimating}>Collapse All</button>
                </div>
            )}
            </div>
            <ol className="space-y-2 border-l-2 border-border ml-4">
            {result.steps.map((step, index) => {
                const isExpanded = !!expandedSteps[index];
                const isAnimated = isAnimating && animatedStepIndex === index;
                return (
                <li 
                    key={index}
                    ref={isAnimated ? activeStepRef : null}
                    className={`relative pl-8 py-2 transition-all duration-300 rounded-r-md -ml-4 -mr-4 pr-4 group ${
                        isAnimated ? 'bg-primary/10' : 'hover:bg-white/5'
                    }`}
                >
                    <div className="absolute -left-px top-5 h-full w-px bg-border"></div>
                    <div className={`absolute -left-[11px] top-[18px] w-6 h-6 bg-panel border-2 rounded-full flex items-center justify-center font-bold text-xs transition-colors duration-300 ${
                        isAnimated ? 'border-primary text-primary' : 'border-border text-primary'
                    }`}>
                    {index + 1}
                    </div>
                    <button 
                    className="w-full text-left flex items-start justify-between cursor-pointer disabled:cursor-default"
                    onClick={() => toggleStep(index)}
                    aria-expanded={isExpanded}
                    aria-controls={`step-details-${index}`}
                    disabled={isAnimating}
                    >
                    <div className="flex items-center gap-2 flex-grow min-w-0">
                        <div className="font-mono text-lg text-text-primary overflow-x-auto py-1">
                        ${step.expression}$
                        </div>
                        <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCopyStep(step.expression, index);
                        }}
                        className="p-1.5 rounded-full text-text-secondary hover:bg-border hover:text-text-primary transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 flex-shrink-0"
                        aria-label="Copy step expression"
                        >
                        {copiedStepIndex === index ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        ) : (
                            <ClipboardIcon className="w-5 h-5" />
                        )}
                        </button>
                    </div>
                    <div className="pt-2 flex-shrink-0 ml-2">
                        <ChevronDownIcon className={`w-5 h-5 text-text-secondary transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                    </button>
                    
                    <div 
                    id={`step-details-${index}`}
                    className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                    >
                    <div className="overflow-hidden">
                        <div className="pt-3 pb-2 pr-4">
                        <p className="text-text-secondary text-sm mb-3">{step.explanation}</p>
                        <div className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full inline-block">
                            APPLY: {step.rule}
                        </div>
                        </div>
                    </div>
                    </div>
                </li>
                );
            })}
            </ol>
        
            {result.symbols && result.symbols.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-sm font-semibold uppercase text-text-secondary tracking-wider mb-3">Symbol Glossary</h3>
                <div className="flex flex-wrap gap-2">
                    {result.symbols.map((symbolDef) => (
                        <button 
                            key={symbolDef.symbol}
                            onClick={() => onSymbolClick(symbolDef)}
                            className="px-4 py-2 bg-panel border border-border rounded-full hover:bg-border hover:text-text-primary transition-colors duration-200"
                            aria-label={`Show definition for ${symbolDef.name}`}
                        >
                            <span className="font-mono text-lg text-text-secondary">${symbolDef.symbol}$</span>
                        </button>
                    ))}
                </div>
            </div>
            )}
        </div>
    </div>
  );
};