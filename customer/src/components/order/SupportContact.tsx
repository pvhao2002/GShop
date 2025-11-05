import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';

interface SupportContactProps {
  orderId: string;
  onSubmitSupport: (message: string, contactMethod: 'email' | 'phone') => Promise<void>;
}

const SupportContact: React.FC<SupportContactProps> = ({
  orderId,
  onSubmitSupport,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter your message');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitSupport(message, contactMethod);
      setModalVisible(false);
      setMessage('');
      Alert.alert(
        'Support Request Submitted',
        'We have received your support request and will contact you soon.'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit support request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickActions = [
    {
      title: 'Track Order',
      description: 'Get real-time updates on your order status',
      action: () => {
        // This will be handled by the parent component
        Alert.alert('Info', 'Tracking information is displayed above');
      },
    },
    {
      title: 'Delivery Issues',
      description: 'Report problems with delivery or damaged items',
      action: () => {
        setMessage('I have an issue with my delivery: ');
        setModalVisible(true);
      },
    },
    {
      title: 'Return/Refund',
      description: 'Request a return or refund for your order',
      action: () => {
        setMessage('I would like to request a return/refund for this order: ');
        setModalVisible(true);
      },
    },
    {
      title: 'Other Issues',
      description: 'Contact support for any other concerns',
      action: () => {
        setMessage('');
        setModalVisible(true);
      },
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Need Help?</Text>
      <Text style={styles.subtitle}>
        Having issues with your order? We're here to help!
      </Text>

      <View style={styles.quickActions}>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionButton}
            onPress={action.action}
          >
            <Text style={styles.actionTitle}>{action.title}</Text>
            <Text style={styles.actionDescription}>{action.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Contact Support</Text>
              <Text style={styles.modalSubtitle}>
                Order #{orderId.slice(-8).toUpperCase()}
              </Text>

              <Text style={styles.label}>How would you like us to contact you?</Text>
              <View style={styles.contactMethodContainer}>
                <TouchableOpacity
                  style={[
                    styles.contactMethodButton,
                    contactMethod === 'email' && styles.activeContactMethod,
                  ]}
                  onPress={() => setContactMethod('email')}
                >
                  <Text
                    style={[
                      styles.contactMethodText,
                      contactMethod === 'email' && styles.activeContactMethodText,
                    ]}
                  >
                    📧 Email
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.contactMethodButton,
                    contactMethod === 'phone' && styles.activeContactMethod,
                  ]}
                  onPress={() => setContactMethod('phone')}
                >
                  <Text
                    style={[
                      styles.contactMethodText,
                      contactMethod === 'phone' && styles.activeContactMethodText,
                    ]}
                  >
                    📞 Phone
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Describe your issue:</Text>
              <TextInput
                style={styles.messageInput}
                multiline
                numberOfLines={6}
                placeholder="Please describe your issue in detail..."
                value={message}
                onChangeText={setMessage}
                textAlignVertical="top"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitButton, isSubmitting && styles.disabledButton]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  <Text style={styles.submitButtonText}>
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  quickActions: {
    gap: 12,
  },
  actionButton: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  contactMethodContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  contactMethodButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
  },
  activeContactMethod: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  contactMethodText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeContactMethodText: {
    color: '#fff',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default SupportContact;