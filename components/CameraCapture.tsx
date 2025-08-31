import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { ImageData } from '../types';

interface CameraCaptureProps {
    onCapture: (imageData: ImageData) => void;
    onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<string | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    useEffect(() => {
        const startCamera = async () => {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                    streamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } catch (err) {
                    console.error("Error accessing camera:", err);
                    setError("Could not access camera. Please check permissions and try again.");
                }
            } else {
                setError("Your browser does not support camera access.");
            }
        };

        startCamera();

        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/png');
                const parts = dataUrl.split(';base64,');
                const mimeType = parts[0].split(':')[1];
                const data = parts[1];
                onCapture({ mimeType, data });
                stopCamera();
            }
        }
    };
    
    const handleClose = () => {
        stopCamera();
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="camera-title">
            <div className="relative w-full max-w-4xl bg-black rounded-lg overflow-hidden border border-border">
                 <h2 id="camera-title" className="sr-only">Camera View</h2>
                {error ? (
                    <div className="bg-danger-bg border border-danger text-danger px-4 py-3 text-center w-full">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline"> {error}</span>
                    </div>
                ) : (
                    <video ref={videoRef} autoPlay playsInline className="w-full h-auto"></video>
                )}
                <canvas ref={canvasRef} className="hidden" aria-hidden="true"></canvas>
            </div>
            <div className="flex gap-4 mt-6">
                <button onClick={handleCapture} disabled={!!error} className="px-6 py-3 bg-primary hover:opacity-90 text-white font-bold rounded-lg shadow-md disabled:bg-border disabled:text-text-secondary disabled:cursor-not-allowed">
                    Capture
                </button>
                <button onClick={handleClose} className="px-6 py-3 bg-panel hover:bg-border text-text-primary font-bold rounded-lg shadow-md">
                    Cancel
                </button>
            </div>
        </div>
    );
};