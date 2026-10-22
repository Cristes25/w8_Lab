// src/screens/ProductCatalogScreen.tsx
import React from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useProducts } from '../hooks/useProducts';
import { useStore } from '../store/useStore';
import { Product } from '../types';

export const ProductCatalogScreen: React.FC = () => {
  const { products, status, errorMessage, refetch } = useProducts();
  const cartCount = useStore((state) => state.cartItems.length); // Atomic Selector!
  const addProduct = useStore((state) => state.addProductToCart);

  if (status === 'loading' && products.length === 0) {
    return (
      <View
        style={styles.centerContainer}
        accessibilityRole="progressbar"
        accessibilityLabel="Loading catalog"
      >
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Fetching University Marketplace...</Text>
      </View>
    );
  }

  if (status === 'error' && products.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.loadingText, { color: '#DC3545' }]}>
          {errorMessage || 'Network error'}
        </Text>
        <TouchableOpacity style={[styles.addButton, { marginTop: 12 }]} onPress={() => refetch()}>
          <Text style={styles.btnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Campus Catalog</Text>
        <Text style={styles.cartBadge}>Cart: {cartCount} items</Text>
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={status === 'loading'}
            onRefresh={refetch}
            tintColor="#0066CC"
          />
        }
        renderItem={({ item }: { item: Product }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => addProduct(item)}>
              <Text style={styles.btnText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default ProductCatalogScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#333333', fontWeight: '600' },
  headerBar: {
    padding: 16,
    backgroundColor: '#0066CC',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  cartBadge: { color: '#E0F0FF', fontWeight: '700' },
  card: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#FFF',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2,
  },
  productName: { fontSize: 16, fontWeight: '600', color: '#212529' },
  productPrice: { fontSize: 14, color: '#6C757D', marginTop: 4 },
  addButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    justifyContent: 'center',
  },
  btnText: { color: '#FFF', fontWeight: '600' },
});
