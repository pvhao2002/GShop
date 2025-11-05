import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  ScrollView,
  Spinner,
  useToast,
  Button,
  AlertDialog,
  Select,
  CheckIcon,
  Divider,
  Badge,
  Icon,
  Pressable
} from 'native-base';
import { FlatList } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { UserStatusBadge, UserRoleBadge } from '../../components/users';
import { userService } from '../../services/userService';
import { User, UserDetailResponse, UserActivity } from '../../types/user';

interface RouteParams {
  userId: string;
}

export const UserDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const toast = useToast();
  const { userId } = route.params as RouteParams;
  const cancelRef = React.useRef(null);

  const [userDetail, setUserDetail] = useState<UserDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'ROLE_USER' | 'ROLE_ADMIN'>('ROLE_USER');
  const [selectedStatus, setSelectedStatus] = useState<'ACTIVE' | 'INACTIVE' | 'SUSPENDED'>('ACTIVE');

  useEffect(() => {
    fetchUserDetail();
  }, [userId]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      const response = await userService.getUserDetail(userId);
      setUserDetail(response);
      setSelectedRole(response.user.role);
      setSelectedStatus(response.user.status);
    } catch (error) {
      console.error('Error fetching user detail:', error);
      toast.show({
        title: "Error",
        description: "Failed to load user details"
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    try {
      setUpdating(true);
      await userService.updateUserRole(userId, selectedRole);
      await fetchUserDetail();
      setShowRoleDialog(false);
      toast.show({
        title: "Success",
        description: "User role updated successfully"
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.show({
        title: "Error",
        description: "Failed to update user role"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      setUpdating(true);
      await userService.updateUserStatus(userId, selectedStatus);
      await fetchUserDetail();
      setShowStatusDialog(false);
      toast.show({
        title: "Success",
        description: "User status updated successfully"
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.show({
        title: "Error",
        description: "Failed to update user status"
      });
    } finally {
      setUpdating(false);
    }
  };

  const renderActivityItem = ({ item }: { item: UserActivity }) => (
    <Box
      bg="white"
      rounded="md"
      p={3}
      mb={2}
      borderWidth={1}
      borderColor="gray.200"
    >
      <VStack space={1}>
        <HStack justifyContent="space-between" alignItems="flex-start">
          <Text fontSize="sm" fontWeight="medium" color="gray.800" flex={1}>
            {item.action}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </HStack>
        <Text fontSize="xs" color="gray.600">
          {item.description}
        </Text>
        {item.ipAddress && (
          <Text fontSize="xs" color="gray.400">
            IP: {item.ipAddress}
          </Text>
        )}
      </VStack>
    </Box>
  );

  const renderOrderItem = ({ item }: { item: any }) => (
    <Box
      bg="white"
      rounded="md"
      p={3}
      mb={2}
      borderWidth={1}
      borderColor="gray.200"
    >
      <HStack justifyContent="space-between" alignItems="center">
        <VStack space={1}>
          <Text fontSize="sm" fontWeight="medium" color="gray.800">
            Order #{item.id}
          </Text>
          <Text fontSize="xs" color="gray.600">
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </VStack>
        <VStack alignItems="flex-end" space={1}>
          <Text fontSize="sm" fontWeight="semibold" color="green.600">
            ${item.totalAmount.toFixed(2)}
          </Text>
          <Badge colorScheme={item.status === 'COMPLETED' ? 'success' : 'warning'} variant="solid">
            {item.status}
          </Badge>
        </VStack>
      </HStack>
    </Box>
  );

  if (loading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg="gray.50">
        <Spinner size="lg" />
        <Text mt={2} color="gray.600">Loading user details...</Text>
      </Box>
    );
  }

  if (!userDetail) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg="gray.50">
        <Icon as={Ionicons} name="person-outline" size="xl" color="gray.400" />
        <Text mt={2} fontSize="lg" color="gray.500">
          User not found
        </Text>
      </Box>
    );
  }

  const { user, orderSummary, recentActivity, recentOrders } = userDetail;

  return (
    <Box flex={1} bg="gray.50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space={4} p={4}>
          {/* Header */}
          <HStack justifyContent="space-between" alignItems="center">
            <Pressable onPress={() => navigation.goBack()}>
              <Icon as={Ionicons} name="arrow-back" size="lg" color="gray.600" />
            </Pressable>
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              User Details
            </Text>
            <Box width="24px" />
          </HStack>

          {/* User Info Card */}
          <Box bg="white" rounded="lg" shadow={1} p={4}>
            <VStack space={4}>
              <HStack justifyContent="space-between" alignItems="flex-start">
                <VStack space={2} flex={1}>
                  <Text fontSize="xl" fontWeight="bold" color="gray.800">
                    {user.firstName} {user.lastName}
                  </Text>
                  <Text fontSize="md" color="gray.600">
                    {user.email}
                  </Text>
                  {user.phone && (
                    <Text fontSize="sm" color="gray.500">
                      📞 {user.phone}
                    </Text>
                  )}
                  {user.address && (
                    <Text fontSize="sm" color="gray.500">
                      📍 {user.address}
                    </Text>
                  )}
                </VStack>
                <VStack space={2} alignItems="flex-end">
                  <UserRoleBadge role={user.role} />
                  <UserStatusBadge status={user.status} />
                </VStack>
              </HStack>

              <Divider />

              <HStack justifyContent="space-between">
                <VStack alignItems="center">
                  <Text fontSize="xs" color="gray.500">JOINED</Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Text>
                </VStack>
                {user.lastLoginAt && (
                  <VStack alignItems="center">
                    <Text fontSize="xs" color="gray.500">LAST LOGIN</Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {new Date(user.lastLoginAt).toLocaleDateString()}
                    </Text>
                  </VStack>
                )}
              </HStack>

              <HStack space={2}>
                <Button
                  flex={1}
                  variant="outline"
                  onPress={() => setShowRoleDialog(true)}
                  isDisabled={updating}
                >
                  Change Role
                </Button>
                <Button
                  flex={1}
                  variant="outline"
                  onPress={() => setShowStatusDialog(true)}
                  isDisabled={updating}
                >
                  Change Status
                </Button>
              </HStack>
            </VStack>
          </Box>

          {/* Order Summary */}
          <Box bg="white" rounded="lg" shadow={1} p={4}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.800" mb={3}>
              Order Summary
            </Text>
            <HStack justifyContent="space-between" mb={4}>
              <VStack alignItems="center" flex={1}>
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  {orderSummary.totalOrders}
                </Text>
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  TOTAL ORDERS
                </Text>
              </VStack>
              <VStack alignItems="center" flex={1}>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  ${orderSummary.totalSpent.toFixed(0)}
                </Text>
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  TOTAL SPENT
                </Text>
              </VStack>
              <VStack alignItems="center" flex={1}>
                <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                  ${orderSummary.averageOrderValue.toFixed(0)}
                </Text>
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  AVG ORDER
                </Text>
              </VStack>
            </HStack>
            {orderSummary.favoriteCategories.length > 0 && (
              <VStack space={2}>
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  Favorite Categories:
                </Text>
                <HStack space={2} flexWrap="wrap">
                  {orderSummary.favoriteCategories.map((category, index) => (
                    <Badge key={index} colorScheme="blue" variant="subtle">
                      {category}
                    </Badge>
                  ))}
                </HStack>
              </VStack>
            )}
          </Box>

          {/* Recent Orders */}
          <Box bg="white" rounded="lg" shadow={1} p={4}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.800" mb={3}>
              Recent Orders
            </Text>
            {recentOrders.length > 0 ? (
              <FlatList
                data={recentOrders}
                renderItem={renderOrderItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                No orders found
              </Text>
            )}
          </Box>

          {/* Recent Activity */}
          <Box bg="white" rounded="lg" shadow={1} p={4}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.800" mb={3}>
              Recent Activity
            </Text>
            {recentActivity.length > 0 ? (
              <FlatList
                data={recentActivity}
                renderItem={renderActivityItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                No recent activity
              </Text>
            )}
          </Box>
        </VStack>
      </ScrollView>

      {/* Role Update Dialog */}
      <AlertDialog isOpen={showRoleDialog} leastDestructiveRef={cancelRef} onClose={() => setShowRoleDialog(false)}>
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Change User Role</AlertDialog.Header>
          <AlertDialog.Body>
            <VStack space={3}>
              <Text>Select new role for {user.firstName} {user.lastName}:</Text>
              <Select
                selectedValue={selectedRole}
                onValueChange={(value) => setSelectedRole(value as 'ROLE_USER' | 'ROLE_ADMIN')}
                _selectedItem={{
                  bg: "blue.500",
                  endIcon: <CheckIcon size="5" />
                }}
              >
                <Select.Item label="Customer" value="ROLE_USER" />
                <Select.Item label="Admin" value="ROLE_ADMIN" />
              </Select>
            </VStack>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button
                variant="unstyled"
                colorScheme="coolGray"
                onPress={() => setShowRoleDialog(false)}
                ref={cancelRef}
              >
                Cancel
              </Button>
              <Button
                onPress={handleUpdateRole}
                isLoading={updating}
              >
                Update
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>

      {/* Status Update Dialog */}
      <AlertDialog isOpen={showStatusDialog} leastDestructiveRef={cancelRef} onClose={() => setShowStatusDialog(false)}>
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Change User Status</AlertDialog.Header>
          <AlertDialog.Body>
            <VStack space={3}>
              <Text>Select new status for {user.firstName} {user.lastName}:</Text>
              <Select
                selectedValue={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED')}
                _selectedItem={{
                  bg: "blue.500",
                  endIcon: <CheckIcon size="5" />
                }}
              >
                <Select.Item label="Active" value="ACTIVE" />
                <Select.Item label="Inactive" value="INACTIVE" />
                <Select.Item label="Suspended" value="SUSPENDED" />
              </Select>
            </VStack>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button
                variant="unstyled"
                colorScheme="coolGray"
                onPress={() => setShowStatusDialog(false)}
                ref={cancelRef}
              >
                Cancel
              </Button>
              <Button
                onPress={handleUpdateStatus}
                isLoading={updating}
              >
                Update
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Box>
  );
};