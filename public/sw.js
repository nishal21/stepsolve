const CACHE_NAME = 'stepsolve-cache-v2';
const urlsToCache = [
  // Core files
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/metadata.json',

  // Components
  '/components/Header.tsx',
  '/components/CalculatorDisplay.tsx',
  '/components/ExplanationPane.tsx',
  '/components/HistorySidebar.tsx',
  '/components/SymbolGlossary.tsx',
  '/components/SettingsModal.tsx',
  '/components/CameraCapture.tsx',
  '/components/LandingPage.tsx',
  '/components/TermsModal.tsx',
  '/components/PrivacyModal.tsx',
  '/components/OfflineIndicator.tsx',
  '/components/ShareModal.tsx',
  '/components/ConfirmModal.tsx',
  '/components/ReferenceModal.tsx',
  '/components/AnalysisModal.tsx',
  
  // Icon Components
  '/components/icons/AccessibilityIcon.tsx',
  '/components/icons/AlertTriangleIcon.tsx',
  '/components/icons/BookOpenIcon.tsx',
  '/components/icons/CalculatorIcon.tsx',
  '/components/icons/CameraIcon.tsx',
  '/components/icons/CheckCircleIcon.tsx',
  '/components/icons/ChevronDownIcon.tsx',
  '/components/icons/ClipboardIcon.tsx',
  '/components/icons/FileTextIcon.tsx',
  '/components/icons/HistoryIcon.tsx',
  '/components/icons/InputIcon.tsx',
  '/components/icons/InstallIcon.tsx',
  '/components/icons/LightbulbIcon.tsx',
  '/components/icons/LinkIcon.tsx',
  '/components/icons/LogoIcon.tsx',
  '/components/icons/PaperclipIcon.tsx',
  '/components/icons/PlayIcon.tsx',
  '/components/icons/SettingsIcon.tsx',
  '/components/icons/ShareIcon.tsx',
  '/components/icons/SparklesIcon.tsx',
  '/components/icons/StepsIcon.tsx',
  '/components/icons/StopIcon.tsx',
  '/components/icons/WandIcon.tsx',
  '/components/icons/WifiOffIcon.tsx',
  '/components/icons/XCircleIcon.tsx',
  '/components/icons/XIcon.tsx',

  // Hooks
  '/hooks/useMathJax.ts',
  '/hooks/useOnlineStatus.ts',
  
  // Services
  '/services/geminiService.ts',
  '/services/offlineService.ts',

  // Utils
  '/utils/imageUtils.ts',
  
  // Public assets
  '/public/manifest.json',
  '/public/logo.svg',

  // External dependencies
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js',
  'https://aistudiocdn.com/react@19.1.1',
  'https://aistudiocdn.com/react-dom@19.1.1/client',
  'https://aistudiocdn.com/@google/genai@1.16.0'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
