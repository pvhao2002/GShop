import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TopProduct {
  product: {
    id: string;
    name: string;
    price: number;
  };
  revenue: number;
  unitsSold: number;
}

interface PerformanceMetricsProps {
  topProducts: TopProduct[];
  isLoading?: boolean;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  topProducts,
  isLoading = false
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Top Performing Products</Text>
        <View style={styles.loadingContainer}>
          {[1, 2, 3].map((index) => (
            <View key={index} style={styles.loadingItem}>
              <View style={styles.loadingBar} />
              <View style={[styles.loadingBar, styles.loadingBarShort]} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (!topProducts || topProducts.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Top Performing Products</Text>
        <View style={styles.emptyContainer}>
          <Ionicons name="shirt-outline" size={48} color="#E0E0E0" />
          <Text style={styles.emptyText}>No product data available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top Performing Products</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {topProducts.map((item, index) => (
          <View key={item.product.id} style={styles.productItem}>
            <View style={styles.rankContainer}>
              <Text style={styles.rank}>#{index + 1}</Text>
            </View>
            
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {item.product.name}
              </Text>
              <Text style={styles.productPrice}>
                {formatCurrency(item.product.price)}
              </Text>
            </View>
            
            <View style={styles.metricsContainer}>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{item.unitsSold}</Text>
                <Text style={styles.metricLabel}>Units Sold</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>
                  {formatCurrency(item.revenue)}
                </Text>
                <Text style={styles.metricLabel}>Revenue</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    maxHeight: 300,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Poppins',
    marginBottom: 16,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  rankContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rank: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    fontFamily: 'Poppins',
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Inter',
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'Inter',
  },
  metricsContainer: {
    alignItems: 'flex-end',
  },
  metric: {
    alignItems: 'flex-end',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A5D23',
    fontFamily: 'Poppins',
  },
  metricLabel: {
    fontSize: 10,
    color: '#999999',
    fontFamily: 'Inter',
  },
  loadingContainer: {
    flex: 1,
  },
  loadingItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  loadingBar: {
    height: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    marginBottom: 4,
  },
  loadingBarShort: {
    width: '60%',
    height: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
    fontFamily: 'Inter',
    marginTop: 12,
  },
});