import React from 'react';
import { XIcon } from './icons/XIcon';
import { WifiOffIcon } from './icons/WifiOffIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface ReferenceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ReferenceSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <section>
        <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-3">
            {icon}
            {title}
        </h3>
        <div className="space-y-4 bg-background p-4 rounded-md border border-border">
            {children}
        </div>
    </section>
);

const ReferenceItem: React.FC<{ command: string; description: string }> = ({ command, description }) => (
    <div>
        <code className="text-sm font-mono bg-panel px-2 py-1 rounded-md text-primary border border-border">{command}</code>
        <p className="text-xs text-text-secondary mt-1 pl-1">{description}</p>
    </div>
);

export const ReferenceModal: React.FC<ReferenceModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="reference-title">
            <div className="bg-panel border border-border rounded-xl shadow-2xl max-w-3xl w-full h-full max-h-[80vh] flex flex-col animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
                <header className="flex justify-between items-center p-6 border-b border-border flex-shrink-0">
                    <h2 id="reference-title" className="text-xl font-bold text-text-primary">Symbol & Function Reference</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary" aria-label="Close Reference">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>
                <main className="p-6 overflow-y-auto text-text-secondary space-y-8 text-sm">
                    <ReferenceSection title="Offline Capabilities" icon={<WifiOffIcon className="w-5 h-5" />}>
                        <p>The offline engine can handle basic arithmetic, polynomial calculus, and equation solving. Type commands exactly as shown.</p>
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-5">
                            <ReferenceItem command="+, -, *, /" description="Basic arithmetic operators." />
                            <ReferenceItem command="^" description="Exponentiation. Example: 2^3" />
                            <ReferenceItem command="pi, e" description="Mathematical constants." />
                            <ReferenceItem command="sqrt(x)" description="Square root. Example: sqrt(16)" />
                            <ReferenceItem command="fact(n)" description="Factorial. Example: fact(5)" />
                            <ReferenceItem command="sin(x), cos(x), tan(x)" description="Trigonometric functions (x in radians)." />
                            <ReferenceItem command="log(x)" description="Base-10 logarithm. Example: log(100)" />
                            <ReferenceItem command="ln(x)" description="Natural logarithm. Example: ln(e)" />
                            <ReferenceItem command="d/dx(...)" description="Derivative of a polynomial. Example: d/dx(3x^2)" />
                            <ReferenceItem command="integrate(...)" description="Indefinite integral of a polynomial. Example: integrate(4x^3)" />
                            <ReferenceItem command="integrate(..., from, to)" description="Definite integral. Example: integrate(x, 0, 5)" />
                            <ReferenceItem command="2x + 5 = 11" description="Solve linear equations." />
                            <ReferenceItem command="x^2 - 5x + 6 = 0" description="Solve quadratic equations." />
                            <ReferenceItem command="x^3 - 6x^2 + 11x - 6 = 0" description="Solve cubic equations." />
                        </div>
                    </ReferenceSection>

                    <ReferenceSection title="Online (AI-Powered) Capabilities" icon={<SparklesIcon className="w-5 h-5 text-primary" />}>
                        <p>When online with a valid API key, the calculator supports a vast range of mathematical notation, including standard functions, LaTeX, and even natural language questions.</p>
                         <div className="grid sm:grid-cols-2 gap-x-4 gap-y-5">
                            <ReferenceItem command="lim(x->0, sin(x)/x)" description="Limits and advanced calculus." />
                            <ReferenceItem command="sum(1/n^2, n=1 to infinity)" description="Summations and series." />
                            <ReferenceItem command="\int_0^1 x^2 dx" description="LaTeX syntax for calculus." />
                            <ReferenceItem command="solve for x, y: 2x+y=5, x-y=1" description="Systems of equations." />
                            <ReferenceItem command="eigenvalues of [[1,2],[3,4]]" description="Linear algebra functions." />
                             <ReferenceItem command="what is the 20th Fibonacci number?" description="Natural language queries." />
                        </div>
                    </ReferenceSection>

                </main>
                <footer className="p-6 border-t border-border flex-shrink-0 text-right">
                    <button onClick={onClose} className="px-6 py-2 bg-primary hover:opacity-90 text-white font-bold rounded-lg transition-colors duration-200">
                        Close
                    </button>
                </footer>
            </div>
        </div>
    );
};
