import { retrieveLaunchParams } from '@tma.js/sdk';

function convertTgWebAppDataToInitDataString(tgWebAppData: unknown): string | null {
  try {
    if (typeof tgWebAppData !== 'object' || tgWebAppData === null) {
      return null;
    }
    
    const data = tgWebAppData as Record<string, unknown>;
    const params: string[] = [];

    if (data.user) {
      const userEncoded = encodeURIComponent(JSON.stringify(data.user));
      params.push(`user=${userEncoded}`);
    }

    if (data.auth_date !== undefined && data.auth_date !== null) {
      let authDate: number;
      if (data.auth_date instanceof Date) {
        authDate = Math.floor(data.auth_date.getTime() / 1000);
      } else if (typeof data.auth_date === 'string') {
        const parsedDate = new Date(data.auth_date);
        if (isNaN(parsedDate.getTime())) {
          return null;
        }
        authDate = Math.floor(parsedDate.getTime() / 1000);
      } else if (typeof data.auth_date === 'number') {
        authDate = data.auth_date;
      } else {
        return null;
      }
      params.push(`auth_date=${authDate}`);
    }

    if (data.query_id) {
      params.push(`query_id=${data.query_id}`);
    }

    if (data.hash) {
      params.push(`hash=${data.hash}`);
    }

    if (data.chat_type) {
      params.push(`chat_type=${data.chat_type}`);
    }

    if (data.chat_instance) {
      params.push(`chat_instance=${data.chat_instance}`);
    }

    if (data.start_param) {
      params.push(`start_param=${encodeURIComponent(String(data.start_param))}`);
    }

    if (data.can_send_after !== undefined) {
      params.push(`can_send_after=${data.can_send_after}`);
    }

    if (data.chat) {
      const chatEncoded = encodeURIComponent(JSON.stringify(data.chat));
      params.push(`chat=${chatEncoded}`);
    }

    if (data.receiver) {
      const receiverEncoded = encodeURIComponent(JSON.stringify(data.receiver));
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
    const tgWebAppData = (launchParams as Record<string, unknown>).tgWebAppData;
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
        const data = tgWebAppData as Record<string, unknown>;
        // Check if there's a direct initData property
        if (data.initData && typeof data.initData === 'string' && data.initData.length > 0) {
          if (import.meta.env.DEV) {
            console.log('✅ Got init data from tgWebAppData.initData');
          }
          return data.initData;
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
      console.error('📦 window.Telegram:', (window as unknown as Record<string, unknown>).Telegram);
      console.error('📦 URL params:', window.location.search);
      console.error('📦 localStorage:', localStorage.getItem('tma-js-sdk-launch-params'));
    }
    throw new Error('Mock mode is enabled but init data is not available. Please refresh the page.');
  }

  throw new Error('Telegram init data not available. Please open this app from Telegram Mini App or use ?mock=true for testing.');
}
