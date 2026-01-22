import { retrieveLaunchParams } from '@tma.js/sdk';

function isMockMode(): boolean {
  if (import.meta.env.VITE_MOCK_TELEGRAM === 'false') {
    return false;
  }

  if (import.meta.env.VITE_MOCK_TELEGRAM === 'true') {
    return true;
  }

  return new URLSearchParams(window.location.search).get('mock') === 'true';
}

export function getTelegramInitData(): string {
  try {
    const { initDataRaw } = retrieveLaunchParams();
    if (typeof initDataRaw === 'string' && initDataRaw.length > 0) {
      return initDataRaw;
    }
  } catch {
    // Ignore errors from retrieveLaunchParams, try fallback
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tg = (window as any)?.Telegram?.WebApp;
  if (tg && typeof tg.initData === 'string' && tg.initData.length > 0) {
    return tg.initData;
  }

  if (isMockMode()) {
    // Try to get from localStorage (saved by initMockEnvironment)
    try {
      const stored = localStorage.getItem('tma-js-sdk-launch-params');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.tgWebAppData && typeof data.tgWebAppData === 'string' && data.tgWebAppData.length > 0) {
          return data.tgWebAppData;
        }
      }
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn('⚠️ Failed to get initData from localStorage:', e);
      }
    }
    
    // Fallback: try to get from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const tgWebAppData = urlParams.get('tgWebAppData');
    if (tgWebAppData && tgWebAppData.length > 0) {
      return tgWebAppData;
    }
    
    throw new Error('Mock mode enabled but initData is missing. Make sure initMockEnvironment() was called.');
  }

  throw new Error('Telegram initData not available');
}
