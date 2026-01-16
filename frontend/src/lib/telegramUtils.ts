import { retrieveLaunchParams } from '@tma.js/sdk';

function convertTgWebAppDataToInitDataString(tgWebAppData: any): string | null {
  try {
    const params: string[] = [];

    if (tgWebAppData.user) {
      const userEncoded = encodeURIComponent(JSON.stringify(tgWebAppData.user));
      params.push(`user=${userEncoded}`);
    }

    if (tgWebAppData.auth_date !== undefined && tgWebAppData.auth_date !== null) {
      let authDate: number;
      if (tgWebAppData.auth_date instanceof Date) {
        authDate = Math.floor(tgWebAppData.auth_date.getTime() / 1000);
      } else if (typeof tgWebAppData.auth_date === 'string') {
        const parsedDate = new Date(tgWebAppData.auth_date);
        if (isNaN(parsedDate.getTime())) {
          return null;
        }
        authDate = Math.floor(parsedDate.getTime() / 1000);
      } else if (typeof tgWebAppData.auth_date === 'number') {
        authDate = tgWebAppData.auth_date;
      } else {
        return null;
      }
      params.push(`auth_date=${authDate}`);
    }

    if (tgWebAppData.query_id) {
      params.push(`query_id=${tgWebAppData.query_id}`);
    }

    if (tgWebAppData.hash) {
      params.push(`hash=${tgWebAppData.hash}`);
    }

    if (tgWebAppData.chat_type) {
      params.push(`chat_type=${tgWebAppData.chat_type}`);
    }

    if (tgWebAppData.chat_instance) {
      params.push(`chat_instance=${tgWebAppData.chat_instance}`);
    }

    if (tgWebAppData.start_param) {
      params.push(`start_param=${encodeURIComponent(tgWebAppData.start_param)}`);
    }

    if (tgWebAppData.can_send_after !== undefined) {
      params.push(`can_send_after=${tgWebAppData.can_send_after}`);
    }

    if (tgWebAppData.chat) {
      const chatEncoded = encodeURIComponent(JSON.stringify(tgWebAppData.chat));
      params.push(`chat=${chatEncoded}`);
    }

    if (tgWebAppData.receiver) {
      const receiverEncoded = encodeURIComponent(JSON.stringify(tgWebAppData.receiver));
      params.push(`receiver=${receiverEncoded}`);
    }

    return params.length > 0 ? params.join('&') : null;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to convert tgWebAppData to init data string:', error);
    }
    return null;
  }
}

function isMockMode(): boolean {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('mock') === 'true' || import.meta.env.VITE_MOCK_TELEGRAM === 'true';
}

export function getTelegramInitData(): string {
  if (import.meta.env.DEV) {
    console.log('🔍 Attempting to retrieve Telegram init data...');
  }

  try {
    const launchParams = retrieveLaunchParams();
    
    if (import.meta.env.DEV) {
      console.log('📦 Launch params keys:', Object.keys(launchParams));
      console.log('📦 initDataRaw:', launchParams.initDataRaw);
    }
    
    // First priority: initDataRaw (direct init data string)
    if (launchParams.initDataRaw && typeof launchParams.initDataRaw === 'string' && launchParams.initDataRaw.length > 0) {
      if (import.meta.env.DEV) {
        console.log('✅ Got init data from retrieveLaunchParams().initDataRaw');
      }
      return launchParams.initDataRaw;
    }

    // Second priority: tgWebAppData (can be string or object)
    const tgWebAppData = (launchParams as any).tgWebAppData;
    if (tgWebAppData) {
      if (import.meta.env.DEV) {
        console.log('📦 tgWebAppData found:', typeof tgWebAppData);
      }
      
      // If tgWebAppData is a string, it's the init data itself
      if (typeof tgWebAppData === 'string' && tgWebAppData.length > 0) {
        if (import.meta.env.DEV) {
          console.log('✅ Got init data from tgWebAppData (string)');
        }
        return tgWebAppData;
      }
      
      // If tgWebAppData is an object, extract init data from it
      if (typeof tgWebAppData === 'object' && tgWebAppData !== null) {
        // Check if there's a direct initData property
        if (tgWebAppData.initData && typeof tgWebAppData.initData === 'string' && tgWebAppData.initData.length > 0) {
          if (import.meta.env.DEV) {
            console.log('✅ Got init data from tgWebAppData.initData');
          }
          return tgWebAppData.initData;
        }
        
        // Convert object to init data string
        const initDataString = convertTgWebAppDataToInitDataString(tgWebAppData);
        if (initDataString) {
          if (import.meta.env.DEV) {
            console.log('✅ Converted tgWebAppData object to init data string');
          }
          return initDataString;
        }
      }
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('⚠️ Failed to retrieve init data:', error);
    }
  }

  // Fallback: Try to read from URL or localStorage directly (for mock mode)
  if (isMockMode()) {
    // Try reading from URL
    const urlParams = new URLSearchParams(window.location.search);
    const tgWebAppData = urlParams.get('tgWebAppData');
    if (tgWebAppData && tgWebAppData.length > 0) {
      if (import.meta.env.DEV) {
        console.log('✅ Got init data from URL (tgWebAppData parameter)');
      }
      return tgWebAppData;
    }

    // Try reading from localStorage
    try {
      const storageKey = 'tma-js-sdk-launch-params';
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.tgWebAppData && typeof data.tgWebAppData === 'string' && data.tgWebAppData.length > 0) {
          if (import.meta.env.DEV) {
            console.log('✅ Got init data from localStorage');
          }
          return data.tgWebAppData;
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('⚠️ Failed to read from localStorage:', error);
      }
    }

    if (import.meta.env.DEV) {
      console.error('❌ Mock mode is enabled but init data is not available');
      console.error('📦 window.Telegram:', (window as any).Telegram);
      console.error('📦 URL params:', window.location.search);
      console.error('📦 localStorage:', localStorage.getItem('tma-js-sdk-launch-params'));
    }
    throw new Error('Mock mode is enabled but init data is not available. Please refresh the page.');
  }

  throw new Error('Telegram init data not available. Please open this app from Telegram Mini App or use ?mock=true for testing.');
}
