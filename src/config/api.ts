// src/config/api.ts
import { Platform } from 'react-native';

export const API_BASE_URL = Platform.select({
  web: 'http://localhost:3000',   // <-- el mismo que usaste en el fetch
  ios: 'http://localhost:3000',
  android: 'http://10.0.2.2:3000',
  default: 'http://localhost:3000',
})!;
