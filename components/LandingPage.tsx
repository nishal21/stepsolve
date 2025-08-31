import React, { useState } from 'react';
import { LogoIcon } from './icons/LogoIcon';
import { StepsIcon } from './icons/StepsIcon';
import { InputIcon } from './icons/InputIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { WifiOffIcon } from './icons/WifiOffIcon';
import { AccessibilityIcon } from './icons/AccessibilityIcon';
import { InstallIcon } from './icons/InstallIcon';
import { ShareIcon } from './icons/ShareIcon';

interface LandingPageProps {
  onLaunch: () => void;
  onShowTerms: () => void;
  onShowPrivacy: () => void;
}

const features = [
  {
    icon: <StepsIcon className="w-6 h-6 text-primary" />,
    title: "Step-by-Step Solutions",
    description: "Understand the 'why' behind every calculation with detailed, AI-generated explanations for each step.",
    howTo: "After a result is calculated, the 'Step-by-Step Solution' panel appears. Click any step to expand and see the detailed explanation and rule applied."
  },
  {
    icon: <InputIcon className="w-6 h-6 text-primary" />,
    title: "Versatile Input",
    description: "Type, use LaTeX, or snap a photo of your handwritten problem. StepSolve understands it all.",
    howTo: "Type in the main input field. Use the 'Upload', 'Camera', or 'URL' buttons below the input to solve a problem from an image."
  },
  {
    icon: <LightbulbIcon className="w-6 h-6 text-primary" />,
    title: "Interactive Glossary",
    description: "Never get stuck on a symbol again. Tap any symbol (like ∫ or ∂) to get an instant, clear definition.",
    howTo: "After a solution with complex symbols is displayed, a 'Symbol Glossary' section will appear. Click any symbol button to see its definition."
  },
  {
    icon: <HistoryIcon className="w-6 h-6 text-primary" />,
    title: "Calculation History",
    description: "Automatically save your work. Revisit past problems and organize your learning journey.",
    howTo: "Your work is saved automatically. Access it from the sidebar on large screens, or by clicking the floating history button on mobile."
  },
  {
    icon: <WifiOffIcon className="w-6 h-6 text-primary" />,
    title: "Offline Ready",
    description: "No internet? No problem. Core arithmetic, algebra, and basic calculus functions work completely offline.",
    howTo: "No setup needed! If your internet disconnects, the app continues to work for supported functions. An offline indicator will appear at the top."
  },
  {
    icon: <AccessibilityIcon className="w-6 h-6 text-primary" />,
    title: "Built for Everyone",
    description: "With full keyboard navigation, high-contrast themes, and screen reader support, learning is accessible to all.",
    howTo: "Use the 'Tab' key to navigate interactive elements. The app respects high-contrast and font size settings from your operating system."
  },
  {
    icon: <InstallIcon className="w-6 h-6 text-primary" />,
    title: "Install as an App",
    description: "Add StepSolve to your home screen for instant access and an offline-ready, app-like experience.",
    howTo: "In your browser, look for an install icon in the address bar or find the 'Add to Home Screen' option in the browser's share menu."
  },
  {
    icon: <ShareIcon className="w-6 h-6 text-primary" />,
    title: "Share & Export",
    description: "Easily share a link to your solution or export your full calculation as a text file.",
    howTo: "From the History sidebar, hover over an item and click the share icon. You can copy a unique link or export the solution to a .txt file."
  }
];

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; howTo: string; }> = ({ icon, title, description, howTo }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const accessibleName = isFlipped ? `Instructions for ${title}. Click to go back to description.` : `Feature: ${title}. Click to see instructions.`;

  return (
    <div className="perspective-1000 h-full min-h-[210px]">
      <div
        className={`relative w-full h-full cursor-pointer transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
        role="button"
        tabIndex={0}
        onClick={() => setIsFlipped(!isFlipped)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsFlipped(!isFlipped); }}
        aria-label={accessibleName}
      >
        {/* Front of the card */}
        <div className="absolute w-full h-full backface-hidden bg-panel border border-border rounded-lg p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-background p-2 rounded-md border border-border">{icon}</div>
              <h3 className="text-lg font-semibold text-text-primary" aria-hidden="true">{title}</h3>
            </div>
            <p className="text-text-secondary text-sm" aria-hidden="true">{description}</p>
          </div>
          <div className="text-xs text-primary mt-4 text-right opacity-70" aria-hidden="true">Click to see how</div>
        </div>
        
        {/* Back of the card */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-panel border border-primary rounded-lg p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-semibold text-primary mb-2" aria-hidden="true">How to use:</h4>
            <p className="text-text-secondary text-sm" aria-hidden="true">{howTo}</p>
          </div>
           <div className="text-xs text-text-secondary mt-4 text-right opacity-70" aria-hidden="true">Click to flip back</div>
        </div>
      </div>
    </div>
  );
};


export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch, onShowTerms, onShowPrivacy }) => {
  return (
    <div className="min-h-screen bg-background font-sans flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl w-full text-center animate-fade-in-up">
        <header className="mb-12">
          <LogoIcon className="w-20 h-20 text-primary mx-auto mb-6" />
          <h1 className="text-4xl sm:text-5xl font-bold text-text-primary tracking-tight mb-4">
            Beyond the Final Answer
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-text-secondary">
            StepSolve is an AI-powered calculator that doesn't just give you the solution. It teaches you the process, one step at a time.
          </p>
        </header>

        <main className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(feature => (
              <FeatureCard 
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                howTo={feature.howTo}
              />
            ))}
          </div>
        </main>

        <footer>
          <button
            onClick={onLaunch}
            className="px-12 py-4 bg-primary hover:opacity-90 text-white font-bold text-lg rounded-lg transition-transform transform hover:scale-105"
          >
            Launch Calculator
          </button>
          <p className="mt-6 text-xs text-text-secondary">
            By launching the calculator, you agree to our{' '}
            <button onClick={onShowTerms} className="underline hover:text-text-primary transition-colors">
              Terms of Service
            </button>
            {' and '}
            <button onClick={onShowPrivacy} className="underline hover:text-text-primary transition-colors">
              Privacy Policy
            </button>
            .
          </p>
        </footer>
      </div>
    </div>
  );
};