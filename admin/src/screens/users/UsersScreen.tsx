import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Pressable, 
  Spinner, 
  Alert,
  useToast,
  Fab,
  Icon
} from 'native-base';
import { FlatList, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SearchBar } from '../../components/management';
import { UserStatusBadge, UserRoleBadge, UserFilters } from '../../components/users';
import { userService } from '../../services/userService';
import { User, UserFilters as UserFiltersType } from '../../types/user';

export const UsersScreen: React.FC = () => {
  const navigation = useNavigation();
  const toast = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = useCallback(async (page: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (page === 1) {
        setLoading(true);
      }

      const filters: UserFiltersType = {
        search: searchQuery || undefined,
        role: selectedRole || undefined,
        status: selectedStatus || undefined,
        page,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      const response = await userService.getUsers(filters);
      
      if (page === 1) {
        setUsers(response.users);
      } else {
        setUsers(prev => [...prev, ...response.users]);
      }
      
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.show({
        title: "Error",
        description: "Failed to load users"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedRole, selectedStatus, toast]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleRoleFilter = (role: string) => {
    setSelectedRole(role);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading) {
      fetchUsers(currentPage + 1);
    }
  };

  const handleUserPress = (user: User) => {
    (navigation as any).navigate('UserDetail', { userId: user.id });
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchUsers(1, true);
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <Pressable
      onPress={() => handleUserPress(item)}
      _pressed={{ opacity: 0.7 }}
      mb={3}
    >
      <Box
        bg="white"
        rounded="lg"
        shadow={1}
        p={4}
        borderWidth={1}
        borderColor="gray.200"
      >
        <VStack space={3}>
          <HStack justifyContent="space-between" alignItems="flex-start">
            <VStack flex={1} space={1}>
              <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                {item.firstName} {item.lastName}
              </Text>
              <Text fontSize="sm" color="gray.600">
                {item.email}
              </Text>
              {item.phone && (
                <Text fontSize="sm" color="gray.500">
                  {item.phone}
                </Text>
              )}
            </VStack>
            <VStack space={2} alignItems="flex-end">
              <UserRoleBadge role={item.role} />
              <UserStatusBadge status={item.status} />
            </VStack>
          </HStack>
          
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize="xs" color="gray.500">
              Joined: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            {item.lastLoginAt && (
              <Text fontSize="xs" color="gray.500">
                Last login: {new Date(item.lastLoginAt).toLocaleDateString()}
              </Text>
            )}
          </HStack>
        </VStack>
      </Box>
    </Pressable>
  );

  const renderFooter = () => {
    if (currentPage >= totalPages) return null;
    
    return (
      <Box py={4} alignItems="center">
        <Spinner size="sm" />
      </Box>
    );
  };

  if (loading && users.length === 0) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg="gray.50">
        <Spinner size="lg" />
        <Text mt={2} color="gray.600">Loading users...</Text>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="gray.50">
      <VStack flex={1} space={4} p={4}>
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            Users Management
          </Text>
          <Text fontSize="sm" color="gray.600">
            {totalCount} users
          </Text>
        </HStack>

        <SearchBar
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChangeText={handleSearch}
        />

        <UserFilters
          selectedRole={selectedRole}
          selectedStatus={selectedStatus}
          onRoleChange={handleRoleFilter}
          onStatusChange={handleStatusFilter}
        />

        {users.length === 0 ? (
          <Box flex={1} justifyContent="center" alignItems="center">
            <Icon as={Ionicons} name="people-outline" size="xl" color="gray.400" />
            <Text mt={2} fontSize="lg" color="gray.500">
              No users found
            </Text>
            <Text fontSize="sm" color="gray.400" textAlign="center">
              {searchQuery || selectedRole || selectedStatus
                ? 'Try adjusting your filters'
                : 'Users will appear here once they register'
              }
            </Text>
          </Box>
        ) : (
          <FlatList
            data={users}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </VStack>

      <Fab
        renderInPortal={false}
        shadow={2}
        size="sm"
        icon={<Icon color="white" as={Ionicons} name="analytics-outline" size="sm" />}
        onPress={() => (navigation as any).navigate('UserAnalytics')}
      />
    </Box>
  );
};