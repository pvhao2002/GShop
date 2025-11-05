import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  ScrollView,
  Divider,
  Badge,
  Image,
  Select,
  Input,
  TextArea,
  useToast,
  Spinner,
  Center,
  Alert,
  Modal,
  FormControl,
} from 'native-base';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { OrderStatusBadge } from '../../components/orders';
import orderService from '../../services/orderService';
import { Order, OrderStatusUpdate } from '../../types/order';

interface RouteParams {
  orderId: string;
}

export const OrderDetailScreen: React.FC = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState<OrderStatusUpdate>({
    status: 'PENDING',
  });
  const [notificationMessage, setNotificationMessage] = useState('');
  
  const route = useRoute();
  const navigation = useNavigation();
  const toast = useToast();
  const { orderId } = route.params as RouteParams;

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const orderData = await orderService.getOrderById(orderId);
      setOrder(orderData);
      setStatusUpdate({
        status: orderData.status,
        trackingNumber: orderData.trackingNumber || '',
        estimatedDelivery: orderData.estimatedDelivery || '',
        notes: '',
      });
    } catch (error) {
      console.error('Error loading order details:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to load order details. Please try again.',
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!order) return;

    try {
      setUpdating(true);
      const updatedOrder = await orderService.updateOrderStatus(order.id, statusUpdate);
      setOrder(updatedOrder);
      setShowStatusModal(false);
      
      toast.show({
        title: 'Success',
        description: 'Order status updated successfully',
      });

      // Send notification if there's a message
      if (statusUpdate.notes?.trim()) {
        await orderService.sendOrderNotification(order.id, statusUpdate.notes.trim());
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to update order status. Please try again.',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleSendNotification = async () => {
    if (!order || !notificationMessage.trim()) return;

    try {
      setUpdating(true);
      await orderService.sendOrderNotification(order.id, notificationMessage.trim());
      setShowNotificationModal(false);
      setNotificationMessage('');
      
      toast.show({
        title: 'Success',
        description: 'Notification sent to customer',
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to send notification. Please try again.',
      });
    } finally {
      setUpdating(false);
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
        return 'error';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return (
      <Center flex={1} bg="gray.50">
        <Spinner size="lg" />
        <Text mt={2}>Loading order details...</Text>
      </Center>
    );
  }

  if (!order) {
    return (
      <Center flex={1} bg="gray.50">
        <Text>Order not found</Text>
      </Center>
    );
  }

  return (
    <Box flex={1} bg="gray.50">
      <ScrollView p={4}>
        <VStack space={4}>
          {/* Header */}
          <HStack justifyContent="space-between" alignItems="center">
            <VStack>
              <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                Order {order.id}
              </Text>
              <Text color="gray.600" fontSize="sm">
                Created: {new Date(order.createdAt).toLocaleString()}
              </Text>
            </VStack>
            <VStack alignItems="flex-end" space={1}>
              <OrderStatusBadge status={order.status} />
              <Badge colorScheme={getPaymentStatusColor(order.paymentStatus)}>
                {order.paymentStatus}
              </Badge>
            </VStack>
          </HStack>

          {/* Action Buttons */}
          <HStack space={2}>
            <Button
              flex={1}
              variant="outline"
              leftIcon={<Ionicons name="create-outline" size={16} />}
              onPress={() => setShowStatusModal(true)}
            >
              Update Status
            </Button>
            <Button
              flex={1}
              variant="outline"
              leftIcon={<Ionicons name="notifications-outline" size={16} />}
              onPress={() => setShowNotificationModal(true)}
            >
              Notify Customer
            </Button>
          </HStack>

          {/* Customer Information */}
          <Box bg="white" p={4} rounded="lg" shadow={1}>
            <Text fontSize="lg" fontWeight="semibold" mb={3}>
              Customer Information
            </Text>
            <VStack space={2}>
              <HStack justifyContent="space-between">
                <Text color="gray.600">Name:</Text>
                <Text fontWeight="medium">
                  {order.customer.firstName} {order.customer.lastName}
                </Text>
              </HStack>
              <HStack justifyContent="space-between">
                <Text color="gray.600">Email:</Text>
                <Text fontWeight="medium">{order.customer.email}</Text>
              </HStack>
              {order.customer.phone && (
                <HStack justifyContent="space-between">
                  <Text color="gray.600">Phone:</Text>
                  <Text fontWeight="medium">{order.customer.phone}</Text>
                </HStack>
              )}
            </VStack>
          </Box>

          {/* Order Details */}
          <Box bg="white" p={4} rounded="lg" shadow={1}>
            <Text fontSize="lg" fontWeight="semibold" mb={3}>
              Order Details
            </Text>
            <VStack space={2}>
              <HStack justifyContent="space-between">
                <Text color="gray.600">Payment Method:</Text>
                <Text fontWeight="medium">{order.paymentMethod}</Text>
              </HStack>
              <HStack justifyContent="space-between">
                <Text color="gray.600">Total Amount:</Text>
                <Text fontWeight="bold" fontSize="lg" color="green.600">
                  ${order.totalAmount.toFixed(2)}
                </Text>
              </HStack>
              {order.trackingNumber && (
                <HStack justifyContent="space-between">
                  <Text color="gray.600">Tracking Number:</Text>
                  <Text fontWeight="medium">{order.trackingNumber}</Text>
                </HStack>
              )}
              {order.estimatedDelivery && (
                <HStack justifyContent="space-between">
                  <Text color="gray.600">Estimated Delivery:</Text>
                  <Text fontWeight="medium">
                    {new Date(order.estimatedDelivery).toLocaleDateString()}
                  </Text>
                </HStack>
              )}
            </VStack>
          </Box>

          {/* Shipping Address */}
          <Box bg="white" p={4} rounded="lg" shadow={1}>
            <Text fontSize="lg" fontWeight="semibold" mb={3}>
              Shipping Address
            </Text>
            <Text>{order.shippingAddress}</Text>
          </Box>

          {/* Order Items */}
          <Box bg="white" p={4} rounded="lg" shadow={1}>
            <Text fontSize="lg" fontWeight="semibold" mb={3}>
              Order Items ({order.orderItems.length})
            </Text>
            <VStack space={3}>
              {order.orderItems.map((item, index) => (
                <Box key={item.id}>
                  <HStack space={3} alignItems="center">
                    <Image
                      source={{ uri: item.productImage }}
                      alt={item.productName}
                      size="60px"
                      rounded="md"
                    />
                    <VStack flex={1} space={1}>
                      <Text fontWeight="medium" numberOfLines={2}>
                        {item.productName}
                      </Text>
                      <HStack space={2}>
                        {item.selectedSize && (
                          <Badge variant="outline" size="sm">
                            Size: {item.selectedSize}
                          </Badge>
                        )}
                        {item.selectedColor && (
                          <Badge variant="outline" size="sm">
                            Color: {item.selectedColor}
                          </Badge>
                        )}
                      </HStack>
                      <HStack justifyContent="space-between" alignItems="center">
                        <Text color="gray.600" fontSize="sm">
                          Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                        </Text>
                        <Text fontWeight="semibold">
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </Text>
                      </HStack>
                    </VStack>
                  </HStack>
                  {index < order.orderItems.length - 1 && <Divider mt={3} />}
                </Box>
              ))}
            </VStack>
          </Box>

          {/* Notes */}
          {order.notes && (
            <Box bg="white" p={4} rounded="lg" shadow={1}>
              <Text fontSize="lg" fontWeight="semibold" mb={3}>
                Order Notes
              </Text>
              <Text>{order.notes}</Text>
            </Box>
          )}
        </VStack>
      </ScrollView>

      {/* Status Update Modal */}
      <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Update Order Status</Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <FormControl>
                <FormControl.Label>Status</FormControl.Label>
                <Select
                  selectedValue={statusUpdate.status}
                  onValueChange={(value) =>
                    setStatusUpdate(prev => ({ ...prev, status: value as any }))
                  }
                >
                  <Select.Item label="Pending" value="PENDING" />
                  <Select.Item label="Confirmed" value="CONFIRMED" />
                  <Select.Item label="Shipped" value="SHIPPED" />
                  <Select.Item label="Completed" value="COMPLETED" />
                  <Select.Item label="Canceled" value="CANCELED" />
                </Select>
              </FormControl>

              {(statusUpdate.status === 'SHIPPED' || statusUpdate.status === 'COMPLETED') && (
                <>
                  <FormControl>
                    <FormControl.Label>Tracking Number</FormControl.Label>
                    <Input
                      value={statusUpdate.trackingNumber}
                      onChangeText={(text) =>
                        setStatusUpdate(prev => ({ ...prev, trackingNumber: text }))
                      }
                      placeholder="Enter tracking number"
                    />
                  </FormControl>

                  <FormControl>
                    <FormControl.Label>Estimated Delivery</FormControl.Label>
                    <Input
                      value={statusUpdate.estimatedDelivery}
                      onChangeText={(text) =>
                        setStatusUpdate(prev => ({ ...prev, estimatedDelivery: text }))
                      }
                      placeholder="YYYY-MM-DD"
                    />
                  </FormControl>
                </>
              )}

              <FormControl>
                <FormControl.Label>Notification Message (Optional)</FormControl.Label>
                <Input
                  value={statusUpdate.notes}
                  onChangeText={(text) =>
                    setStatusUpdate(prev => ({ ...prev, notes: text }))
                  }
                  placeholder="Message to send to customer..."
                  multiline
                  numberOfLines={3}
                />
              </FormControl>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button
                variant="ghost"
                colorScheme="blueGray"
                onPress={() => setShowStatusModal(false)}
              >
                Cancel
              </Button>
              <Button
                onPress={handleStatusUpdate}
                isLoading={updating}
              >
                Update Status
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Notification Modal */}
      <Modal isOpen={showNotificationModal} onClose={() => setShowNotificationModal(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Send Notification</Modal.Header>
          <Modal.Body>
            <FormControl>
              <FormControl.Label>Message</FormControl.Label>
              <Input
                value={notificationMessage}
                onChangeText={setNotificationMessage}
                placeholder="Enter message to send to customer..."
                multiline
                numberOfLines={4}
              />
            </FormControl>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button
                variant="ghost"
                colorScheme="blueGray"
                onPress={() => setShowNotificationModal(false)}
              >
                Cancel
              </Button>
              <Button
                onPress={handleSendNotification}
                isLoading={updating}
                isDisabled={!notificationMessage.trim()}
              >
                Send Notification
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Box>
  );
};