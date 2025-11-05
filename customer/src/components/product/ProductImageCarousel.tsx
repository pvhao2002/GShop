import React, { useState } from 'react';
import {
  Box,
  Image,
  HStack,
  Pressable,
  Modal,
  IconButton,
} from 'native-base';
import { Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProductImageCarouselProps {
  images: string[];
  productName: string;
}

const { width: screenWidth } = Dimensions.get('window');

const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({
  images,
  productName,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  const displayImages = images.length > 0 ? images : ['https://via.placeholder.com/400x400?text=No+Image'];

  const handleImagePress = (index: number) => {
    setSelectedImageIndex(index);
    setIsZoomModalOpen(true);
  };

  return (
    <>
      <Box>
        {/* Main Image */}
        <Pressable onPress={() => handleImagePress(selectedImageIndex)}>
          <Image
            source={{ uri: displayImages[selectedImageIndex] }}
            alt={productName}
            width={screenWidth}
            height={screenWidth}
            resizeMode="cover"
          />
        </Pressable>

        {/* Image Thumbnails */}
        {displayImages.length > 1 && (
          <Box px={4} py={3}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <HStack space={2}>
                {displayImages.map((image, index) => (
                  <Pressable
                    key={index}
                    onPress={() => setSelectedImageIndex(index)}
                  >
                    <Box
                      borderWidth={selectedImageIndex === index ? 2 : 1}
                      borderColor={selectedImageIndex === index ? 'primary.500' : 'gray.200'}
                      rounded="md"
                      overflow="hidden"
                    >
                      <Image
                        source={{ uri: image }}
                        alt={`${productName} ${index + 1}`}
                        width={60}
                        height={60}
                        resizeMode="cover"
                      />
                    </Box>
                  </Pressable>
                ))}
              </HStack>
            </ScrollView>
          </Box>
        )}
      </Box>

      {/* Zoom Modal */}
      <Modal
        isOpen={isZoomModalOpen}
        onClose={() => setIsZoomModalOpen(false)}
        size="full"
      >
        <Modal.Content bg="black" maxWidth="100%" maxHeight="100%">
          <Modal.Header bg="black" borderBottomWidth={0}>
            <HStack justifyContent="space-between" alignItems="center" width="100%">
              <Box />
              <IconButton
                icon={<Ionicons name="close" size={24} color="white" />}
                onPress={() => setIsZoomModalOpen(false)}
              />
            </HStack>
          </Modal.Header>
          <Modal.Body bg="black" flex={1} justifyContent="center" alignItems="center">
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentOffset={{ x: selectedImageIndex * screenWidth, y: 0 }}
            >
              {displayImages.map((image, index) => (
                <Box key={index} width={screenWidth} justifyContent="center" alignItems="center">
                  <Image
                    source={{ uri: image }}
                    alt={`${productName} ${index + 1}`}
                    width={screenWidth}
                    height={screenWidth}
                    resizeMode="contain"
                  />
                </Box>
              ))}
            </ScrollView>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </>
  );
};

export default ProductImageCarousel;