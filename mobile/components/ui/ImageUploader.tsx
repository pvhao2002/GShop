import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

interface ImageUploaderProps {
  label?: string;
  maxImages?: number;
  images: string[];
  onImagesChange: (images: string[]) => void;
  error?: string;
  isRequired?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label = 'Images',
  maxImages = 5,
  images,
  onImagesChange,
  error,
  isRequired = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to upload images.'
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    if (images.length >= maxImages) {
      Alert.alert('Limit Reached', `You can only upload up to ${maxImages} images.`);
      return;
    }

    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    setIsLoading(true);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newImages = [...images, result.assets[0].uri];
        onImagesChange(newImages);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {isRequired && <Text style={styles.required}> *</Text>}
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageContainer}>
        {images.map((uri, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image source={{ uri }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeImage(index)}
            >
              <Ionicons name="close-circle" size={24} color="#D32F2F" />
            </TouchableOpacity>
          </View>
        ))}

        {images.length < maxImages && (
          <TouchableOpacity
            style={[styles.uploadButton, error && styles.uploadButtonError]}
            onPress={pickImage}
            disabled={isLoading}
          >
            <Ionicons
              name={isLoading ? "hourglass" : "camera"}
              size={32}
              color="#666666"
            />
            <Text style={styles.uploadText}>
              {isLoading ? 'Loading...' : 'Add Image'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {error && <Text style={styles.errorText}>{error}</Text>}
      
      <Text style={styles.helperText}>
        {images.length}/{maxImages} images • Tap to add, tap X to remove
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  required: {
    color: '#D32F2F',
  },
  imageContainer: {
    flexDirection: 'row',
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 80,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  uploadButton: {
    width: 80,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  uploadButtonError: {
    borderColor: '#D32F2F',
  },
  uploadText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'Inter',
  },
  errorText: {
    fontSize: 14,
    color: '#D32F2F',
    marginTop: 4,
    fontFamily: 'Inter',
  },
  helperText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
    fontFamily: 'Inter',
  },
});