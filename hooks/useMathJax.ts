
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    MathJax: {
      typesetPromise: (elements?: HTMLElement[]) => Promise<void>;
      startup: {
        promise: Promise<void>;
      };
    };
  }
}

export const useMathJax = (dependencies: any[]) => {
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const typeset = async () => {
      if (window.MathJax && window.MathJax.startup) {
        await window.MathJax.startup.promise;
        if (nodeRef.current) {
            await window.MathJax.typesetPromise([nodeRef.current]);
        }
      }
    };

    typeset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeRef, ...dependencies]);

  return nodeRef;
};
