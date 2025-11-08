import React, {useCallback, useEffect, useState} from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {APP_CONFIG} from '@/constants/app-config';
import axios from 'axios';
import {useRouter} from "expo-router";

const {width} = Dimensions.get('window');

interface Product {
    id: number;
    name: string;
    price: number;
    images: string[];
}

interface Category {
    id: number;
    name: string;
    description?: string;
    productCount?: number;
}

export default function HomeScreen() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Extra data for trending / sale
    const [trending, setTrending] = useState<Product[]>([]);
    const [saleProducts, setSaleProducts] = useState<Product[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchAll = async () => {
            try {
                await Promise.all([
                    axios.get(`${APP_CONFIG.BASE_URL}${APP_CONFIG.API.PRODUCTS.NEWEST}`).then(res => setProducts(res.data || [])),
                    axios.get(`${APP_CONFIG.BASE_URL}${APP_CONFIG.API.CATEGORIES.BASE}`).then(res => setCategories(res.data || [])),
                    Promise.all([
                        axios.get(`${APP_CONFIG.BASE_URL}${APP_CONFIG.API.PRODUCTS.TREND}`),
                        axios.get(`${APP_CONFIG.BASE_URL}${APP_CONFIG.API.PRODUCTS.FLASH}`)
                    ]).then(([trend, flash]) => {
                        setTrending(trend.data ?? []);
                        setSaleProducts(flash.data ?? []);
                    })
                ]);
            } catch (err) {
                console.warn('⚠️ loadAll failed:', err);
            }
        };

        fetchAll().then();
    }, []); // ✅ không còn cảnh báo nữa

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        const fetchAll = async () => {
            try {
                await Promise.all([
                    axios.get(`${APP_CONFIG.BASE_URL}${APP_CONFIG.API.PRODUCTS.NEWEST}`).then(res => setProducts(res.data || [])),
                    axios.get(`${APP_CONFIG.BASE_URL}${APP_CONFIG.API.CATEGORIES.BASE}`).then(res => setCategories(res.data || [])),
                    Promise.all([
                        axios.get(`${APP_CONFIG.BASE_URL}${APP_CONFIG.API.PRODUCTS.TREND}`),
                        axios.get(`${APP_CONFIG.BASE_URL}${APP_CONFIG.API.PRODUCTS.FLASH}`)
                    ]).then(([trend, flash]) => {
                        setTrending(trend.data ?? []);
                        setSaleProducts(flash.data ?? []);
                    })
                ]);
            } catch (err) {
                console.warn('⚠️ loadAll failed:', err);
            }
        };

        fetchAll().then();
        setRefreshing(false);
    }, []);

    const renderProduct = ({item}: { item: Product }) => (
        <TouchableOpacity style={styles.productCard} activeOpacity={0.8}
                          onPress={() => router.push(`/(product)/${item.id}`)} // ✅ chuyển sang chi tiết
        >
            <Image
                source={{uri: item.images?.[0] || `${APP_CONFIG.IMAGE_URL}/placeholder.jpg`}}
                style={styles.productImage}
            />
            <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.productPrice}>{item.price.toLocaleString('vi-VN')} ₫</Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']}/>}
        >
            {/* 🔹 Header */}
            <View style={styles.header}>
                <Text style={styles.brand}>GShop</Text>
                <Ionicons name="notifications-outline" size={26} color="#1f2937"/>
            </View>

            {/* 🔹 Banner */}
            <View style={styles.bannerContainer}>
                <Image source={require('@/assets/images/fashion-banner.jpg')} style={styles.bannerImage}/>
                <View style={styles.bannerTextBox}>
                    <Text style={styles.bannerTitle}>New Collection 2025</Text>
                    <Text style={styles.bannerSubtitle}>Style meets comfort</Text>
                    <TouchableOpacity style={styles.shopNowBtn}>
                        <Text style={styles.shopNowText}>Shop Now</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 🔥 Trending */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔥 Trending Now</Text>
                {trending.length > 0 ? (
                    <FlatList
                        data={trending}
                        horizontal
                        renderItem={renderProduct}
                        keyExtractor={(item) => item.id.toString()}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{paddingVertical: 8}}
                    />
                ) : (
                    <Text style={styles.noProduct}>No trending products.</Text>
                )}
            </View>

            {/* 💬 Tip Box */}
            <View style={styles.tipBox}>
                <Ionicons name="sparkles-outline" size={20} color="#2563eb"/>
                <Text style={styles.tipText}>
                    Gợi ý hôm nay: Áo croptop + quần jean sáng màu là combo cực hot mùa này!
                </Text>
            </View>

            {/* 🔹 Categories */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Categories</Text>
                {loading ? (
                    <ActivityIndicator size="small" color="#2563eb" style={{marginVertical: 10}}/>
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {categories.length > 0 ? (
                            categories.map((cat) => (
                                <TouchableOpacity key={cat.id} style={styles.categoryCard} activeOpacity={0.8}>
                                    <Ionicons name="shirt-outline" size={22} color="#111827"/>
                                    <Text style={styles.categoryText} numberOfLines={1}>{cat.name}</Text>
                                    {cat.productCount !== undefined && (
                                        <Text style={styles.categoryCount}>{cat.productCount} items</Text>
                                    )}
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={styles.noCategory}>No categories found</Text>
                        )}
                    </ScrollView>
                )}
            </View>

            {/* ⚡ Flash Sale */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>⚡ Flash Sale</Text>
                    <TouchableOpacity onPress={() => router.push('/product')}>
                        <Text style={styles.viewAll}>View All</Text>
                    </TouchableOpacity>
                </View>
                {saleProducts.length > 0 ? (
                    <FlatList
                        data={saleProducts}
                        horizontal
                        renderItem={renderProduct}
                        keyExtractor={(item) => item.id.toString()}
                        showsHorizontalScrollIndicator={false}
                    />
                ) : (
                    <Text style={styles.noProduct}>No sale items yet.</Text>
                )}
            </View>

            {/* 🆕 New Arrivals */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>New Arrivals</Text>
                    <TouchableOpacity onPress={() => router.push('/product')}>
                        <Text style={styles.viewAll}>View All</Text>
                    </TouchableOpacity>
                </View>
                {products.length > 0 ? (
                    <FlatList
                        data={products}
                        horizontal
                        renderItem={renderProduct}
                        keyExtractor={(item) => item.id.toString()}
                        showsHorizontalScrollIndicator={false}
                    />
                ) : (
                    <Text style={styles.noProduct}>No products yet.</Text>
                )}
            </View>

            {/* 📸 Lookbook */}
            <View style={styles.lookbook}>
                <Text style={styles.sectionTitle}>Lookbook</Text>
                <View style={styles.lookbookGrid}>
                    <Image source={require('@/assets/images/look1.jpg')} style={styles.lookImg}/>
                    <Image source={require('@/assets/images/look2.jpg')} style={styles.lookImg}/>
                    <Image source={require('@/assets/images/look3.jpg')} style={styles.lookImg}/>
                </View>
            </View>

            {/* 🔹 Featured Section */}
            <View style={styles.featuredBox}>
                <Image source={require('@/assets/images/featured.jpg')} style={styles.featuredImg}/>
                <View style={styles.featuredText}>
                    <Text style={styles.featuredTitle}>Exclusive Winter Sale</Text>
                    <Text style={styles.featuredDesc}>Up to 50% OFF for top brands</Text>
                    <TouchableOpacity style={styles.featuredBtn}>
                        <Text style={styles.featuredBtnText}>Explore</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#fff'},
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 6,
    },
    brand: {fontSize: 26, fontWeight: '800', color: '#111827'},

    searchBox: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        marginHorizontal: 16,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        alignItems: 'center',
    },
    searchInput: {marginLeft: 8, flex: 1, fontSize: 14, color: '#111827'},

    bannerContainer: {position: 'relative', marginTop: 10},
    bannerImage: {
        width: width - 24,
        height: 180,
        borderRadius: 16,
        marginHorizontal: 12,
        resizeMode: 'cover',
    },
    bannerTextBox: {position: 'absolute', bottom: 20, left: 28},
    bannerTitle: {color: '#fff', fontSize: 22, fontWeight: '800'},
    bannerSubtitle: {color: '#e5e7eb', marginTop: 4},
    shopNowBtn: {
        marginTop: 10,
        backgroundColor: '#111827',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    shopNowText: {color: '#fff', fontWeight: '600'},

    section: {marginTop: 24, paddingHorizontal: 16},
    sectionHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
    sectionTitle: {fontSize: 18, fontWeight: '700', color: '#111827'},
    viewAll: {color: '#2563eb', fontWeight: '600'},
    noProduct: {marginTop: 8, color: '#9ca3af', textAlign: 'center'},
    noCategory: {marginTop: 8, color: '#9ca3af'},

    tipBox: {
        backgroundColor: '#e0f2fe',
        marginHorizontal: 16,
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },
    tipText: {marginLeft: 8, color: '#1e3a8a', fontSize: 13, flex: 1},

    categoryCard: {
        backgroundColor: '#f3f4f6',
        padding: 10,
        marginRight: 10,
        borderRadius: 12,
        alignItems: 'center',
        width: 100,
    },
    categoryText: {marginTop: 4, fontSize: 13, fontWeight: '600', color: '#111827'},
    categoryCount: {fontSize: 11, color: '#6b7280', marginTop: 2},

    productCard: {
        width: 140,
        marginRight: 14,
        borderRadius: 14,
        backgroundColor: '#f9fafb',
        padding: 8,
        elevation: 2,
    },
    productImage: {width: '100%', height: 140, borderRadius: 12, marginBottom: 6},
    productName: {fontWeight: '600', fontSize: 14, color: '#111827'},
    productPrice: {fontWeight: '700', color: '#2563eb', marginTop: 4},

    featuredBox: {
        marginTop: 30,
        marginHorizontal: 14,
        backgroundColor: '#f1f5f9',
        borderRadius: 16,
        overflow: 'hidden',
    },
    featuredImg: {width: '100%', height: 160, resizeMode: 'cover'},
    featuredText: {position: 'absolute', top: 18, left: 18},
    featuredTitle: {fontSize: 20, fontWeight: '800', color: '#fff'},
    featuredDesc: {color: '#e5e7eb', marginTop: 4},
    featuredBtn: {
        marginTop: 10,
        backgroundColor: '#2563eb',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    featuredBtnText: {color: '#fff', fontWeight: '600'},

    lookbook: {marginTop: 24, paddingHorizontal: 16},
    lookbookGrid: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 10},
    lookImg: {width: (width - 48) / 3, height: 100, borderRadius: 12},
});
