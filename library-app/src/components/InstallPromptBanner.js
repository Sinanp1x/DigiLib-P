import React, { useEffect, useState } from 'react';

function InstallPromptBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    console.log('🏁 Component mounted');

    const isInStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

      console.log('isInStandaloneMode:', isInStandaloneMode);

    const handleBeforeInstallPrompt = (e) => {
      console.log('📲 Before install prompt event fired');
      if (!isInStandaloneMode) {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowBanner(true);
      }else {
        console.log('App is already installed or running in standalone mode');
      }
      
    };
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
      } else {
        console.log('❌ User dismissed the install prompt');
      }
      setDeferredPrompt(null);
      setShowBanner(false);
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg flex justify-between items-center z-50">
      <span className="text-sm sm:text-base">📱 Install Al-Burhan Library App</span>
      <button
        onClick={handleInstallClick}
        className="ml-4 bg-white text-blue-600 px-3 py-1 rounded hover:bg-blue-100"
      >
        Install
      </button>
    </div>
  );
}

export default InstallPromptBanner;
