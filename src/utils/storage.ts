// Adaptador seguro para token: web usa localStorage, nativo usa SecureStore/Keychain/AsyncStorage si existen
import { Platform } from 'react-native';

const TOKEN_KEY = 'token';
const isWeb = Platform.OS === 'web';

let SecureStore: any = null;
let Keychain: any = null;
let AsyncStorage: any = null;

if (!isWeb) {
  try { SecureStore = require('expo-secure-store'); } catch {}
  try { Keychain = require('react-native-keychain'); } catch {}
  try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch {}
}

async function setItem(key: string, value: string) {
  try {
    if (isWeb) { localStorage.setItem(key, value); return; }
    if (SecureStore?.setItemAsync) { await SecureStore.setItemAsync(key, value, { keychainService: 'app-token' }); return; }
    if (Keychain?.setGenericPassword) { await Keychain.setGenericPassword('auth', value, { service: 'app-token' }); return; }
    if (AsyncStorage?.setItem) { await AsyncStorage.setItem(key, value); return; }
  } catch {}
  (globalThis as any).__MEM_STORE__ = (globalThis as any).__MEM_STORE__ || {};
  (globalThis as any).__MEM_STORE__[key] = value;
}

async function getItem(key: string): Promise<string | null> {
  try {
    if (isWeb) return localStorage.getItem(key);
    if (SecureStore?.getItemAsync) return await SecureStore.getItemAsync(key);
    if (Keychain?.getGenericPassword) {
      const creds = await Keychain.getGenericPassword({ service: 'app-token' });
      return creds ? (creds.password as string) : null;
    }
    if (AsyncStorage?.getItem) return await AsyncStorage.getItem(key);
  } catch {}
  return (globalThis as any).__MEM_STORE__?.[key] ?? null;
}

async function deleteItem(key: string) {
  try {
    if (isWeb) { localStorage.removeItem(key); return; }
    if (SecureStore?.deleteItemAsync) { await SecureStore.deleteItemAsync(key); return; }
    if (Keychain?.resetGenericPassword) { await Keychain.resetGenericPassword({ service: 'app-token' }); return; }
    if (AsyncStorage?.removeItem) { await AsyncStorage.removeItem(key); return; }
  } catch {}
  if ((globalThis as any).__MEM_STORE__) delete (globalThis as any).__MEM_STORE__[key];
}

export const tokenStorage = {
  set: (token: string) => setItem(TOKEN_KEY, token),
  get: () => getItem(TOKEN_KEY),
  delete: () => deleteItem(TOKEN_KEY),
};
