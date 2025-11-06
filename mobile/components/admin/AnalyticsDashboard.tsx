import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text } from 'react-native';
import { RevenueChart } from './RevenueChart';
import { PerformanceMetrics } from './PerformanceMetrics';
import adminService from '@/services/adminService';

interface RevenueDataPoint {
  period: string;
  revenue: number;
  orderCount: number;
}

interface TopProduct {
  product: {
    id: string;
    name: string;
    price: number;
  };
  revenue: number;
  unitsSold: number;
}

interface AnalyticsData {
  totalRevenue: number;
  revenueByPeriod: RevenueDataPoint[];
  topProducts: TopProduct[];
}

interface AnalyticsDashboardProps {
  period?: 'week' | 'month' | 'year';
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  period = 'month'
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminService.getRevenueAnalytics(period);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      setError('Failed to load analytics data');
      // Set mock data for development/demo purposes
      setAnalyticsData({
        totalRevenue: 2500000,
        revenueByPeriod: [
          { period: 'Week 1', revenue: 500000, orderCount: 25 },
          { period: 'Week 2', revenue: 750000, orderCount: 38 },
          { period: 'Week 3', revenue: 600000, orderCount: 30 },
          { period: 'Week 4', revenue: 650000, orderCount: 32 },
        ],
        topProducts: [
          {
            product: { id: '1', name: 'Premium Cotton T-Shirt', price: 299000 },
            revenue: 1500000,
            unitsSold: 50
          },
          {
            product: { id: '2', name: 'Denim Jacket', price: 899000 },
            revenue: 1200000,
            unitsSold: 15
          },
          {
            product: { id: '3', name: 'Summer Dress', price: 599000 },
            revenue: 800000,
            unitsSold: 20
          },
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [period]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Total Revenue Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Revenue ({period})</Text>
          <Text style={styles.summaryValue}>
            {isLoading ? '...' : formatCurrency(analyticsData?.totalRevenue || 0)}
          </Text>
        </View>

        {/* Revenue Chart */}
        <View style={styles.chartContainer}>
          <RevenueChart 
            data={analyticsData?.revenueByPeriod || []}
            isLoading={isLoading}
          />
        </View>

        {/* Performance Metrics */}
        <View style={styles.metricsContainer}>
          <PerformanceMetrics 
            topProducts={analyticsData?.topProducts || []}
            isLoading={isLoading}
          />
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {error}. Showing demo data for development.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
    fontFamily: 'Inter',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4A5D23',
    fontFamily: 'Poppins',
  },
  chartContainer: {
    marginBottom: 16,
  },
  metricsContainer: {
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#856404',
    fontFamily: 'Inter',
    textAlign: 'center',
  },
});