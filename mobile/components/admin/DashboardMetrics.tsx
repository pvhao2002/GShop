import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { DashboardCard } from './DashboardCard';
import { useAdminStore } from '@/store/adminStore';
import adminService from '@/services/adminService';

interface DashboardMetricsProps {
  onCardPress?: (cardType: 'orders' | 'revenue' | 'users' | 'products') => void;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ onCardPress }) => {
  const { 
    dashboardMetrics, 
    isLoading, 
    setDashboardMetrics, 
    setLoading, 
    setError 
  } = useAdminStore();

  const [refreshing, setRefreshing] = React.useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getDashboardData();
      setDashboardMetrics(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.metricsGrid}>
        <View style={styles.row}>
          <View style={styles.halfCard}>
            <DashboardCard
              title="Total Orders"
              value={isLoading ? '...' : formatNumber(dashboardMetrics?.totalOrders || 0)}
              {...(dashboardMetrics?.recentOrders?.length && { subtitle: `${dashboardMetrics.recentOrders.length} recent` })}
              icon="receipt-outline"
              color="#4A90E2"
              onPress={() => onCardPress?.('orders')}
              isLoading={isLoading}
            />
          </View>
          <View style={styles.halfCard}>
            <DashboardCard
              title="Total Revenue"
              value={isLoading ? '...' : formatCurrency(dashboardMetrics?.totalRevenue || 0)}
              subtitle="All time"
              icon="trending-up-outline"
              color="#4A5D23"
              onPress={() => onCardPress?.('revenue')}
              isLoading={isLoading}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCard}>
            <DashboardCard
              title="Total Users"
              value={isLoading ? '...' : formatNumber(dashboardMetrics?.totalUsers || 0)}
              subtitle="Registered customers"
              icon="people-outline"
              color="#9B59B6"
              onPress={() => onCardPress?.('users')}
              isLoading={isLoading}
            />
          </View>
          <View style={styles.halfCard}>
            <DashboardCard
              title="Total Products"
              value={isLoading ? '...' : formatNumber(dashboardMetrics?.totalProducts || 0)}
              {...(dashboardMetrics?.topProducts?.length && { subtitle: `${dashboardMetrics.topProducts.length} top sellers` })}
              icon="shirt-outline"
              color="#E67E22"
              onPress={() => onCardPress?.('products')}
              isLoading={isLoading}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  metricsGrid: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  halfCard: {
    flex: 1,
    marginHorizontal: 4,
  },
});