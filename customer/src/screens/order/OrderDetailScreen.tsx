import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { RootState, AppDispatch } from '../../store';
import {
  fetchOrderById,
  cancelOrder,
  trackOrder,
  requestSupport,
  clearCurrentOrder,
  clearTrackingInfo,
} from '../../store/slices/orderSlice';
import { TrackingTimeline, SupportContact } from '../../components/order';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { MainStackParamList } from '../../navigation/MainNavigator';

type OrderDetailScreenRouteProp = RouteProp<MainStackParamList, 'OrderDetail'>;

const OrderDetailScreen: React.FC = () => {
  const route = useRoute<OrderDetailScreenRouteProp>();
  const { orderId } = route.params;
  
  const dispatch = useDispatch<AppDispatch>();
  const {
    currentOrder,
    trackingInfo,
    loading,
    error,
  } = useSelector((state: RootState) => state.order);

  const [refreshing, setRefreshing] = useState(false);
  const [showTracking, setShowTracking] = useState(false);

  // Fetch order details when screen is focused
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchOrderById(orderId));
      return () => {
        dispatch(clearCurrentOrder());
        dispatch(clearTrackingInfo());
      };
    }, [dispatch, orderId])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchOrderById(orderId)).unwrap();
      if (showTracking) {
        await dispatch(trackOrder(orderId)).unwrap();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh order details');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, orderId, showTracking]);

  const handleCancelOrder = useCallback(() => {
    if (!currentOrder) return;

    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(cancelOrder({ orderId })).unwrap();
              Alert.alert('Success', 'Order has been canceled successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel order. Please try again.');
            }
          },
        },
      ]
    );
  }, [dispatch, orderId, currentOrder]);

  const handleTrackOrder = useCallback(async () => {
    if (!showTracking) {
      try {
        await dispatch(trackOrder(orderId)).unwrap();
        setShowTracking(true);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch tracking information');
      }
    } else {
      setShowTracking(false);
      dispatch(clearTrackingInfo());
    }
  }, [dispatch, orderId, showTracking]);

  const handleSupportRequest = useCallback(async (message: string, contactMethod: 'email' | 'phone') => {
    await dispatch(requestSupport({ orderId, message, contactMethod })).unwrap();
  }, [dispatch, orderId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#FFA500';
      case 'CONFIRMED':
        return '#4169E1';
      case 'SHIPPED':
        return '#32CD32';
      case 'COMPLETED':
        return '#228B22';
      case 'CANCELED':
        return '#DC143C';
      default:
        return '#666';
    }
  };

  const canCancelOrder = currentOrder && 
    (currentOrder.status === 'PENDING' || currentOrder.status === 'CONFIRMED');

  if (loading && !currentOrder) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentOrder) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Order Not Found</Text>
          <Text style={styles.errorSubtitle}>
            The order you're looking for could not be found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      >
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderTop}>
            <Text style={styles.orderId}>
              Order #{currentOrder.id.slice(-8).toUpperCase()}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentOrder.status) }]}>
              <Text style={styles.statusText}>{currentOrder.status}</Text>
            </View>
          </View>
          
          <Text style={styles.orderDate}>
            Placed on {formatDate(currentOrder.createdAt)}
          </Text>
          
          <View style={styles.orderSummary}>
            <Text style={styles.totalAmount}>
              Total: {formatCurrency(currentOrder.totalAmount)}
            </Text>
            <Text style={styles.paymentMethod}>
              Payment: {currentOrder.paymentMethod} ({currentOrder.paymentStatus})
            </Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {currentOrder.orderItems.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Image 
                source={{ uri: item.productImage }} 
                style={styles.itemImage}
                defaultSource={require('../../../assets/icon.png')}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.productName}</Text>
                {item.selectedSize && (
                  <Text style={styles.itemVariant}>Size: {item.selectedSize}</Text>
                )}
                {item.selectedColor && (
                  <Text style={styles.itemVariant}>Color: {item.selectedColor}</Text>
                )}
                <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                {formatCurrency(item.unitPrice * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <Text style={styles.shippingAddress}>{currentOrder.shippingAddress}</Text>
        </View>

        {/* Order Notes */}
        {currentOrder.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Notes</Text>
            <Text style={styles.orderNotes}>{currentOrder.notes}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.trackButton}
            onPress={handleTrackOrder}
          >
            <Text style={styles.trackButtonText}>
              {showTracking ? 'Hide Tracking' : 'Track Order'}
            </Text>
          </TouchableOpacity>
          
          {canCancelOrder && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelOrder}
            >
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tracking Information */}
        {showTracking && trackingInfo && (
          <TrackingTimeline
            trackingHistory={trackingInfo.trackingHistory}
            currentStatus={trackingInfo.status}
          />
        )}

        {/* Support Contact */}
        <SupportContact
          orderId={orderId}
          onSubmitSupport={handleSupportRequest}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  orderHeader: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  orderHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  orderSummary: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  paymentMethod: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemVariant: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    alignSelf: 'flex-start',
  },
  shippingAddress: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  orderNotes: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  trackButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  trackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#DC143C',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderDetailScreen;