import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Order, OrderStatus } from '../../types';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import orderService from '../../services/orderService';

interface TrackingInfo {
  status: OrderStatus;
  statusHistory: Array<{
    status: OrderStatus;
    timestamp: Date;
    note?: string;
  }>;
  estimatedDelivery?: Date;
  trackingNumber?: string;
}

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setIsLoading(true);

      const [orderData, trackingData] = await Promise.all([
        orderService.getOrderById(orderId!),
        orderService.trackOrder(orderId!),
      ]);

      setOrder(orderData);
      setTrackingInfo(trackingData.trackingInfo);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case 'pending':
        return '#FF9800';
      case 'processing':
        return '#2196F3';
      case 'shipped':
        return '#9C27B0';
      case 'delivered':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return '#999999';
    }
  };

  const getStatusText = (status: OrderStatus): string => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleCancelOrder = () => {
    if (!order || order.status !== 'pending') return;

    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await orderService.cancelOrder(order.id);
              setOrder(prev => prev ? { ...prev, status: 'cancelled' } : null);
              Alert.alert('Success', 'Order cancelled successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to cancel order');
            }
          },
        },
      ]
    );
  };

  const renderTrackingHistory = () => {
    if (!trackingInfo?.statusHistory) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Tracking</Text>
        
        {trackingInfo.trackingNumber && (
          <View style={styles.trackingNumber}>
            <Text style={styles.trackingLabel}>Tracking Number:</Text>
            <Text style={styles.trackingValue}>{trackingInfo.trackingNumber}</Text>
          </View>
        )}

        {trackingInfo.estimatedDelivery && (
          <View style={styles.estimatedDelivery}>
            <Text style={styles.trackingLabel}>Estimated Delivery:</Text>
            <Text style={styles.trackingValue}>
              {formatDate(trackingInfo.estimatedDelivery)}
            </Text>
          </View>
        )}

        <View style={styles.trackingHistory}>
          {trackingInfo.statusHistory.map((item, index) => (
            <View key={index} style={styles.trackingItem}>
              <View style={styles.trackingDot}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: getStatusColor(item.status) },
                  ]}
                />
                {index < trackingInfo.statusHistory.length - 1 && (
                  <View style={styles.line} />
                )}
              </View>
              <View style={styles.trackingContent}>
                <Text style={styles.trackingStatus}>
                  {getStatusText(item.status)}
                </Text>
                <Text style={styles.trackingDate}>
                  {formatDate(item.timestamp)}
                </Text>
                {item.note && (
                  <Text style={styles.trackingNote}>{item.note}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={styles.placeholder} />
        </View>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Header */}
        <View style={styles.section}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderId}>
                Order #{order.id.slice(-8).toUpperCase()}
              </Text>
              <Text style={styles.orderDate}>
                Placed on {formatDate(order.createdAt)}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Image
                source={{ uri: 'https://via.placeholder.com/80x80' }}
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>Product #{item.productId.slice(-6)}</Text>
                <Text style={styles.itemVariant}>
                  Size: {item.sizeId} • Color: {item.colorId}
                </Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                {formatCurrency(item.totalPrice)}
              </Text>
            </View>
          ))}
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <View style={styles.addressContainer}>
            <Text style={styles.addressText}>
              {order.shippingAddress.street}
            </Text>
            <Text style={styles.addressText}>
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
            </Text>
            <Text style={styles.addressText}>
              {order.shippingAddress.country}
            </Text>
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentMethod}>
              Payment Method: {order.paymentMethod.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(order.subtotal)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(order.tax)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(order.shipping)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(order.total)}
              </Text>
            </View>
          </View>
        </View>

        {/* Tracking Information */}
        {renderTrackingHistory()}

        {/* Action Buttons */}
        {order.status === 'pending' && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelOrder}
            >
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Poppins',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    fontFamily: 'Poppins',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Inter',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
  orderItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Inter',
    marginBottom: 4,
  },
  itemVariant: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Inter',
  },
  addressContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#333333',
    fontFamily: 'Inter',
    marginBottom: 4,
  },
  paymentInfo: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
  },
  paymentMethod: {
    fontSize: 14,
    color: '#333333',
    fontFamily: 'Inter',
  },
  summaryContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333333',
    fontFamily: 'Inter',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    paddingTop: 8,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Inter',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Inter',
  },
  trackingNumber: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  estimatedDelivery: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  trackingLabel: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter',
  },
  trackingValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Inter',
  },
  trackingHistory: {
    marginTop: 8,
  },
  trackingItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  trackingDot: {
    alignItems: 'center',
    marginRight: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  line: {
    width: 2,
    height: 24,
    backgroundColor: '#E8E8E8',
    marginTop: 4,
  },
  trackingContent: {
    flex: 1,
  },
  trackingStatus: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Inter',
    marginBottom: 4,
  },
  trackingDate: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter',
    marginBottom: 4,
  },
  trackingNote: {
    fontSize: 14,
    color: '#999999',
    fontFamily: 'Inter',
  },
  actionContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  cancelButton: {
    backgroundColor: '#F44336',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    fontFamily: 'Inter',
  },
});