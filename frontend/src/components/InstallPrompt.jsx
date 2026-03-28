import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

const InstallPrompt = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Already running as standalone PWA
    if (window.__pwaInstalled || window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    // User already dismissed
    if (localStorage.getItem('pwa-dismissed')) return;

    const tryShow = () => {
      if (window.__pwaInstallEvent) {
        setTimeout(() => setShowBanner(true), 1500);
      }
    };

    // If beforeinstallprompt already fired before this component mounted
    if (window.__pwaInstallEvent) {
      tryShow();
    } else {
      // Wait for it in case it hasn't fired yet
      window.addEventListener('pwa-prompt-ready', tryShow, { once: true });
    }

    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShowBanner(false);
    });

    return () => {
      window.removeEventListener('pwa-prompt-ready', tryShow);
    };
  }, []);

  const handleInstall = async () => {
    const prompt = window.__pwaInstallEvent;
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    window.__pwaInstallEvent = null;
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-dismissed', '1');
  };

  if (!showBanner || installed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] sm:left-auto sm:right-4 sm:w-96">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary-500 to-emerald-400" />
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center shrink-0 border border-primary-100">
              <Smartphone className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Install HomeServe App</h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Faster access, offline support & a native app feel on your home screen.
                  </p>
                </div>
                <button
                  onClick={handleDismiss}
                  className="ml-2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors shrink-0"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleInstall}
                  className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install App
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
