import React from 'react';
import { XIcon } from './icons/XIcon';

interface PrivacyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="privacy-title">
            <div className="bg-panel border border-border rounded-xl shadow-2xl max-w-3xl w-full h-full max-h-[80vh] flex flex-col animate-fade-in-up" style={{animationDuration: '0.3s'}}>
                <div className="flex justify-between items-center p-6 border-b border-border flex-shrink-0">
                    <h2 id="privacy-title" className="text-xl font-bold text-text-primary">Privacy Policy</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary" aria-label="Close Privacy Policy">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto text-text-secondary space-y-4 text-sm">
                    <p>Your privacy is important to us. It is StepSolve's policy to respect your privacy regarding any information we may collect from you across our website.</p>
                    
                    <h4 className="font-semibold text-text-primary pt-2">1. Information We Collect</h4>
                    <p>We do not collect or store any personal information on our servers. The application functionality relies on an API key that you provide.</p>
                    
                    <h4 className="font-semibold text-text-primary pt-2">2. API Key Storage</h4>
                    <p>Your Google AI API Key is stored exclusively in your web browser's <code className="text-xs bg-background p-1 rounded">localStorage</code>. It is not transmitted to, collected by, or stored on StepSolve's servers at any time. The key is only used by your browser to make direct calls to the Google Gemini API.</p>
                    
                    <h4 className="font-semibold text-text-primary pt-2">3. Third-Party Services</h4>
                    <p>When you perform a calculation, your input data (the equation or image) and your API key are sent directly from your browser to the Google Gemini API. We are not responsible for the privacy practices of Google. We encourage you to review Google's privacy policy.</p>

                    <h4 className="font-semibold text-text-primary pt-2">4. Cookies</h4>
                    <p>We do not use cookies for tracking purposes.</p>

                    <h4 className="font-semibold text-text-primary pt-2">5. Children's Privacy</h4>
                    <p>Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13.</p>

                    <h4 className="font-semibold text-text-primary pt-2">Changes to This Privacy Policy</h4>
                    <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>
                </div>
                 <div className="p-6 border-t border-border flex-shrink-0 text-right">
                    <button onClick={onClose} className="px-6 py-2 bg-primary hover:opacity-90 text-white font-bold rounded-lg transition-colors duration-200">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
