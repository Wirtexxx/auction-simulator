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
  } catch {}

  const tg = (window as any)?.Telegram?.WebApp;
  if (tg && typeof tg.initData === 'string' && tg.initData.length > 0) {
    return tg.initData;
  }

  if (isMockMode()) {
    const stored = localStorage.getItem('telegram:initData');
    if (typeof stored === 'string' && stored.length > 0) {
      return stored;
    }
    throw new Error('Mock mode enabled but initData is missing');
  }

  throw new Error('Telegram initData not available');
}
