// src/hooks/useProducts.ts
import { useState, useEffect, useCallback } from 'react';
import { Product, AsyncStatus } from '../types';
import { apiClient } from '../services/apiClient';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<AsyncStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchProductsWithBackoff = useCallback(async (retries = 3, baseDelay = 500) => {
    setStatus('loading');
    setErrorMessage(null);
    let attempt = 0;

    while (attempt < retries) {
      try {
        const { data } = await apiClient.get<Product[]>('/products');
        setProducts(data);
        setStatus('success');
        return;
      } catch (err: any) {
        attempt++;
        if (
          attempt >= retries ||
          (err.response?.status >= 400 && err.response?.status < 500 && err.response?.status !== 429)
        ) {
          setStatus('error');
          setErrorMessage(err.response?.data?.message || err.message || 'Network error');
          return;
        }

        // Exponential Backoff with Full Random Jitter
        const expDelay = Math.min(8000, baseDelay * Math.pow(2, attempt));
        const jittered = Math.random() * expDelay;
        await new Promise((r) => setTimeout(r, jittered));
      }
    }
  }, []);

  useEffect(() => {
    fetchProductsWithBackoff();
  }, [fetchProductsWithBackoff]);

  return { products, status, errorMessage, refetch: fetchProductsWithBackoff };
};
