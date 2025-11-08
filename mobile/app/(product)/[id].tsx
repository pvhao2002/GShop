import React, {useEffect, useRef, useState} from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import axios from 'axios';
import {APP_CONFIG} from '@/constants/app-config';
import { useCartStore } from '@/store/cartStore';

const {width, height} = Dimensions.get('window');

interface Variant {
    id: number;
    color?: string;
    colorHex?: string;
    size?: string;
    quantity?: number;
    additionalPrice?: number;
}

interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    images: string[];
    variants?: Variant[];
    category?: { id: number; name: string };
    totalInventory?: number;
    availableColors?: string[];
    availableSizes?: string[];
}

export default function ProductDetailScreen() {
    const {id} = useLocalSearchParams();
    const router = useRouter();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const [showZoom, setShowZoom] = useState(false);
    const [zoomIndex, setZoomIndex] = useState(0);
    const [cartMessage, setCartMessage] = useState<string | null>(null);
    const addToCart = useCartStore((state) => state.addItem);


    const handleAddToCart = () => {
        if (product?.variants?.length && !selectedVariant) {
            setCartMessage('⚠️ Please select a variant before adding to cart.');
            return;
        }

        // 🔹 Nếu variant được chọn nhưng hết hàng
        if (selectedVariant && (!selectedVariant.quantity || selectedVariant.quantity <= 0)) {
            setCartMessage('❌ Out of stock for this variant.');
            return;
        }

        const cartItem = {
            productId: product!.id,
            name: product!.name,
            price: product!.price + (selectedVariant?.additionalPrice ?? 0),
            image: product!.images?.[0],
            variant: selectedVariant
                ? {
                    variantId: selectedVariant.id,
                    color: selectedVariant.color,
                    size: selectedVariant.size,
                    quantity: 1,
                    additionalPrice: selectedVariant.additionalPrice,
                }
                : null,
            quantity: 1,
        };

        addToCart(cartItem);
        setCartMessage('✅ Added to cart!');
    };



    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${APP_CONFIG.BASE_URL}${APP_CONFIG.API.PRODUCTS.BASE}/${id}`);
                setProduct(res.data);
                console.log(id);
            } catch (err) {
                console.error('Error loading product:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        if (cartMessage) {
            const timer = setTimeout(() => setCartMessage(null), 2000);
            return () => clearTimeout(timer);
        }
    }, [id, cartMessage]);

    const handleScroll = (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setActiveIndex(index);
    };

    if (loading) {
        return (
            <View style={s.center}>
                <ActivityIndicator size="large" color="#2563eb"/>
            </View>
        );
    }

    if (!product) {
        return (
            <View style={s.center}>
                <Text>Product not found</Text>
            </View>
        );
    }

    return (
        <>
            <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
                <View style={s.carouselContainer}>
                    <FlatList
                        ref={flatListRef}
                        data={product.images}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        keyExtractor={(_, i) => i.toString()}
                        renderItem={({item, index}) => (
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => {
                                    setZoomIndex(index);
                                    setShowZoom(true);
                                }}
                            >
                                <Image source={{uri: item}} style={s.imageSlide}/>
                            </TouchableOpacity>
                        )}
                    />
                    <View style={s.indicatorContainer}>
                        {product.images.map((_, i) => (
                            <View key={i} style={[s.dot, activeIndex === i && s.dotActive]}/>
                        ))}
                    </View>
                </View>
                {cartMessage ? (
                    <View style={s.toastBox}>
                        <Text style={s.toastText}>{cartMessage}</Text>
                    </View>
                ): null}
                <View style={s.content}>
                    <Text style={s.name}>{product.name}</Text>
                    <Text style={s.category}>{product.category?.name}</Text>
                    <Text style={s.price}>{product.price.toLocaleString('vi-VN')} ₫</Text>
                    {selectedVariant?.additionalPrice && selectedVariant.additionalPrice > 0 ? (
                        <Text style={s.addPrice}>
                            + {selectedVariant.additionalPrice.toLocaleString('vi-VN')} ₫
                        </Text>
                    ): null}
                    <View style={s.line}/>
                    {product.variants && product.variants.length > 0 ? (
                        <Text style={s.stockText}>
                            Stock: {selectedVariant?.quantity ?? 0} items
                        </Text>
                    ) : product.totalInventory ? (
                        <Text style={s.stockText}>
                            Stock: {product.totalInventory} items
                        </Text>
                    ) : null}
                    <Text style={s.descTitle}>Description</Text>
                    <Text style={s.desc}>{product.description || 'No description available.'}</Text>
                    {product.variants && product.variants.length > 0 ? (
                        <>
                            <View style={s.variantSection}>
                                <Text style={s.variantTitle}>Choose Variant</Text>
                                <View style={s.variantBox}>
                                    {product.variants.map((v) => (
                                        <TouchableOpacity
                                            key={v.id}
                                            style={[
                                                s.variantItem,
                                                selectedVariant?.id === v.id && s.variantSelected,
                                            ]}
                                            onPress={() => setSelectedVariant(v)}
                                            activeOpacity={0.9}
                                        >
                                            <View
                                                style={[s.colorCircle, {backgroundColor: v.colorHex || '#d1d5db'}]}
                                            />
                                            <Text style={s.variantText}>
                                                {v.size ?? v.color ?? 'Option'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                            {selectedVariant && (
                                <View style={s.variantDetailBox}>
                                    <Text style={s.variantDetailText}>
                                        • Size: <Text style={s.bold}>{selectedVariant.size || '—'}</Text>
                                    </Text>
                                    <Text style={s.variantDetailText}>
                                        • Color: <Text style={s.bold}>{selectedVariant.color || '—'}</Text>
                                    </Text>
                                    <Text style={s.variantDetailText}>
                                        • Quantity: <Text style={s.bold}>{selectedVariant.quantity ?? 0}</Text>
                                    </Text>
                                </View>
                            )}
                        </>
                    ) : null}
                    <TouchableOpacity
                        style={s.addBtn}
                        activeOpacity={0.9}
                        onPress={handleAddToCart}
                    >
                        <Ionicons name="cart-outline" color="#fff" size={20}/>
                        <Text style={s.addText}>Add to Cart</Text>
                    </TouchableOpacity>
                </View>
                <Modal visible={showZoom} transparent animationType="fade">
                    <View style={s.zoomBackdrop}>
                        <FlatList
                            data={product.images}
                            horizontal
                            pagingEnabled
                            initialScrollIndex={zoomIndex}
                            getItemLayout={(_, index) => ({
                                length: width,
                                offset: width * index,
                                index,
                            })}
                            showsHorizontalScrollIndicator={false}
                            renderItem={({item}) => (
                                <Pressable
                                    style={{
                                        width,
                                        height,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Image source={{uri: item}} style={s.zoomImage} resizeMode="contain"/>
                                </Pressable>
                            )}
                        />
                        <TouchableOpacity style={s.closeZoom} onPress={() => setShowZoom(false)}>
                            <Ionicons name="close-circle" size={36} color="#fff"/>
                        </TouchableOpacity>
                    </View>
                </Modal>
            </ScrollView>
        </>
    );
}

const s = StyleSheet.create({
    safe: {flex: 1, backgroundColor: '#fff'},
    container: {flex: 1},
    center: {flex: 1, alignItems: 'center', justifyContent: 'center'},

    carouselContainer: {marginTop: 0, position: 'relative'},
    imageSlide: {width, height: 340, resizeMode: 'cover'},
    indicatorContainer: {
        position: 'absolute',
        bottom: 12,
        flexDirection: 'row',
        alignSelf: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
        backgroundColor: '#d1d5db',
    },
    dotActive: {backgroundColor: '#2563eb'},

    content: {paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40},
    name: {fontSize: 22, fontWeight: '800', color: '#111827'},
    category: {color: '#6b7280', marginTop: 4},
    price: {color: '#2563eb', fontWeight: '800', fontSize: 20, marginTop: 8},
    addPrice: {color: '#dc2626', marginTop: 4, fontWeight: '600'},

    descTitle: {fontWeight: '700', fontSize: 16, marginTop: 20, color: '#111827'},
    desc: {color: '#4b5563', marginTop: 6, lineHeight: 20},

    variantSection: {marginTop: 24},
    variantTitle: {fontWeight: '700', fontSize: 16, marginBottom: 8, color: '#111827'},
    variantBox: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
    variantItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginRight: 10,
    },
    variantSelected: {borderColor: '#2563eb', backgroundColor: '#eff6ff'},
    colorCircle: {
        width: 14,
        height: 14,
        borderRadius: 7,
        marginRight: 6,
    },
    variantText: {color: '#111827', fontWeight: '500'},
    variantDetailBox: {marginTop: 10, backgroundColor: '#f9fafb', borderRadius: 10, padding: 10},
    variantDetailText: {color: '#374151', marginBottom: 4},
    bold: {fontWeight: '700'},

    line: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginTop: 16,
        marginBottom: 10,
    },
    stockText: {color: '#6b7280', fontSize: 13},

    addBtn: {
        backgroundColor: '#2563eb',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 13,
        borderRadius: 30,
        marginTop: 26,
    },
    addText: {color: '#fff', fontWeight: '700', marginLeft: 8, fontSize: 15},

    zoomBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    zoomImage: {
        width: width,
        height: height * 0.85,
    },
    closeZoom: {
        position: 'absolute',
        top: 50,
        right: 20,
    },
    toastBox: {
        marginTop: 12,
        backgroundColor: '#111827',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignSelf: 'center',
    },
    toastText: {
        color: '#fff',
        fontWeight: '500',
    },
});
