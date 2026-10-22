// src/store/useStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Product, CartItem } from '../types';

interface AuthSlice {
  currentUser: User | null;
  isAuthenticated: boolean;
  setAuthenticatedUser: (user: User) => void;
  logoutUser: () => void;
}

interface CartSlice {
  cartItems: CartItem[];
  addProductToCart: (product: Product) => void;
  removeProductFromCart: (productId: string) => void;
  emptyCart: () => void;
}

export type RootStore = AuthSlice & CartSlice;

export const useStore = create<RootStore>()(
  persist(
    (set, get) => ({
      // Auth Slice Implementation
      currentUser: null,
      isAuthenticated: false,
      setAuthenticatedUser: (user) => set({ currentUser: user, isAuthenticated: true }),
      logoutUser: () => set({ currentUser: null, isAuthenticated: false }),

      // Cart Slice Implementation
      cartItems: [],
      addProductToCart: (product) => set((state) => {
        const existingIndex = state.cartItems.findIndex(i => i.product.id === product.id);
        if (existingIndex > -1) {
          const updated = [...state.cartItems];
          updated[existingIndex].quantity += 1;
          return { cartItems: updated };
        }
        return { cartItems: [...state.cartItems, { product, quantity: 1 }] };
      }),
      removeProductFromCart: (productId) => set((state) => ({
        cartItems: state.cartItems.filter(i => i.product.id !== productId)
      })),
      emptyCart: () => set({ cartItems: [] }),
    }),
    {
      name: 'cloudcart-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ cartItems: state.cartItems }), // Only persist cart
    }
  )
);