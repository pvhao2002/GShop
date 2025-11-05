import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Order } from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface OrderCardProps {
  order: Order;
  onPress: (orderId: string) => void;
}

const getStatusColor = (status: Order['status']) => {
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

const getStatusText = (status: Order['status']) => {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'CONFIRMED':
      return 'Confirmed';
    case 'SHIPPED':
      return 'Shipped';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELED':
      return 'Canceled';
    default:
      return status;
  }
};

const OrderCard: React.FC<OrderCardProps> = ({ order, onPress }) => {
  const firstItem = order.orderItems[0];
  const itemCount = order.orderItems.length;

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress(order.id)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.orderId}>Order #{order.id.slice(-8).toUpperCase()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.itemInfo}>
          {firstItem && (
            <Image 
              source={{ uri: firstItem.productImage }} 
              style={styles.productImage}
              defaultSource={require('../../../assets/icon.png')}
            />
          )}
          <View style={styles.itemDetails}>
            <Text style={styles.productName} numberOfLines={1}>
              {firstItem?.productName || 'Product'}
            </Text>
            {itemCount > 1 && (
              <Text style={styles.itemCount}>
                +{itemCount - 1} more item{itemCount > 2 ? 's' : ''}
              </Text>
            )}
            <Text style={styles.orderDate}>
              Ordered on {formatDate(order.createdAt)}
            </Text>
          </View>
        </View>

        <View style={styles.priceInfo}>
          <Text style={styles.totalAmount}>
            {formatCurrency(order.totalAmount)}
          </Text>
          <Text style={styles.paymentMethod}>
            {order.paymentMethod}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Tap to view details
        </Text>
        {order.trackingNumber && (
          <Text style={styles.trackingNumber}>
            Tracking: {order.trackingNumber}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
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
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  itemCount: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  paymentMethod: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerText: {
    fontSize: 12,
    color: '#007AFF',
  },
  trackingNumber: {
    fontSize: 12,
    color: '#666',
  },
});

export default OrderCard;