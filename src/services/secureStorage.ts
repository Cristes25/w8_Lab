// src/services/secureStorage.ts
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'cloudcart_access_token';
const REFRESH_TOKEN_KEY = 'cloudcart_refresh_token';

export const SecureStorageService = {
  async saveTokens(accessToken: string, refreshToken?: string): Promise<void> {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  async saveToken(accessToken: string, refreshToken?: string): Promise<void> {
    return this.saveTokens(accessToken, refreshToken);
  },

  async getAccessToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },

  async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};