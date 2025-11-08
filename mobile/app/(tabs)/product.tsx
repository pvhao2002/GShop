import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    Dimensions,
    Modal,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { APP_CONFIG } from '@/constants/app-config';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface Product {
    id: number;
    name: string;
    price: number;
    images: string[];
    category?: { id: number; name: string };
}

interface PagedResponse<T> {
    content: T[];
    page: number;
    totalPages: number;
}

export default function ProductScreen() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [overlayLoading, setOverlayLoading] = useState(false); // ✅ full-screen loading

    const loadProducts = async (pageNum = 0, searchQuery = '') => {
        try {
            if (pageNum === 0) setOverlayLoading(true);
            else setLoading(true);

            const res = await axios.get(`${APP_CONFIG.BASE_URL}${APP_CONFIG.API.PRODUCTS.BASE}`, {
                params: { page: pageNum, size: 10, search: searchQuery || undefined },
            });

            const data: PagedResponse<Product> = res.data;
            if (pageNum === 0) setProducts(data.content);
            else setProducts(prev => [...prev, ...data.content]);

            setTotalPages(data.totalPages ?? 1);
            setPage(pageNum);
        } catch (err) {
            console.error('Error loading products:', err);
        } finally {
            setOverlayLoading(false);
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadProducts(0);
    }, []);

    const onRefresh = useCallback(() => {
        loadProducts(0, search);
    }, [search]);

    const handleLoadMore = () => {
        if (!loading && page + 1 < totalPages) {
            loadProducts(page + 1, search);
        }
    };

    const handleSearch = () => {
        loadProducts(0, search);
    };

    const renderItem = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => router.push(`/(product)/${item.id}`)}
        >
            <Image
                source={{
                    uri: item.images?.[0] || `${APP_CONFIG.IMAGE_URL}/placeholder.jpg`,
                }}
                style={styles.image}
            />
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.category}>{item.category?.name ?? 'Uncategorized'}</Text>
                <Text style={styles.price}>{item.price.toLocaleString('vi-VN')} ₫</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>All Products</Text>
                <TouchableOpacity onPress={onRefresh}>
                    <Ionicons name="refresh-outline" size={22} color="#111827" />
                </TouchableOpacity>
            </View>

            {/* Search bar */}
            <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={20} color="#6b7280" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search fashion items..."
                    value={search}
                    onChangeText={setSearch}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                />
            </View>

            {/* Product list */}
            {products.length === 0 && overlayLoading ? (
                <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={products}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 80 }}
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.3}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#2563eb']}
                            tintColor="#2563eb"
                        />
                    }
                    ListFooterComponent={
                        loading && products.length > 0 ? (
                            <ActivityIndicator size="small" color="#2563eb" style={{ marginVertical: 10 }} />
                        ) : null
                    }
                />
            )}

            {/* ✅ Overlay loading spinner */}
            <Modal visible={overlayLoading} transparent animationType="fade">
                <View style={styles.overlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.overlayText}>Loading products...</Text>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        paddingTop: 18,
        paddingBottom: 10,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: { fontSize: 22, fontWeight: '800', color: '#111827' },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        marginLeft: 6,
        color: '#111827',
        fontSize: 15,
    },
    card: {
        backgroundColor: '#f9fafb',
        width: (width - 36) / 2,
        borderRadius: 14,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 180,
        resizeMode: 'cover',
    },
    info: { padding: 8 },
    name: { fontWeight: '600', fontSize: 14, color: '#111827' },
    category: { fontSize: 12, color: '#6b7280', marginTop: 2 },
    price: { color: '#2563eb', fontWeight: '700', marginTop: 6 },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayText: {
        marginTop: 8,
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
