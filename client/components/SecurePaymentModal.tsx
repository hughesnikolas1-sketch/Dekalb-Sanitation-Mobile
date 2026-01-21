import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { BrandColors, Spacing, BorderRadius, FontSizes, FuturisticGradients } from '@/constants/theme';
import { ThemedText } from '@/components/ThemedText';
import { apiRequest } from '@/lib/query-client';
import { useTheme } from '@/hooks/useTheme';

interface SecurePaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (paymentIntentId: string) => void;
  amount: number;
  serviceName: string;
  serviceDescription?: string;
  serviceType: 'residential' | 'commercial';
  serviceId: string;
  formData?: Record<string, unknown>;
}

const formatCardNumber = (text: string): string => {
  const cleaned = text.replace(/\D/g, '');
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ').substring(0, 19) : '';
};

const formatExpiry = (text: string): string => {
  const cleaned = text.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
  }
  return cleaned;
};

const validateCard = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\s/g, '');
  return cleaned.length >= 15 && cleaned.length <= 16;
};

const validateExpiry = (expiry: string): boolean => {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10) + 2000;
  const now = new Date();
  const expiryDate = new Date(year, month - 1);
  return month >= 1 && month <= 12 && expiryDate > now;
};

const validateCVC = (cvc: string): boolean => {
  return cvc.length >= 3 && cvc.length <= 4;
};

export function SecurePaymentModal({
  visible,
  onClose,
  onSuccess,
  amount,
  serviceName,
  serviceDescription,
  serviceType,
  serviceId,
  formData,
}: SecurePaymentModalProps) {
  const [step, setStep] = useState<'details' | 'processing' | 'success' | 'error'>('details');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processingMessage, setProcessingMessage] = useState('Initializing secure payment...');
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  
  const scaleAnim = useSharedValue(0.9);
  const successScale = useSharedValue(0);
  
  useEffect(() => {
    if (visible) {
      scaleAnim.value = withSpring(1, { damping: 15, stiffness: 150 });
      setStep('details');
      setCardNumber('');
      setExpiry('');
      setCvc('');
      setCardholderName('');
      setZipCode('');
      setErrors({});
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  const successAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: successScale.value,
  }));

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }
    
    if (!validateCard(cardNumber)) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }
    
    if (!validateExpiry(expiry)) {
      newErrors.expiry = 'Please enter a valid expiry date (MM/YY)';
    }
    
    if (!validateCVC(cvc)) {
      newErrors.cvc = 'Please enter a valid CVC';
    }
    
    if (!zipCode.trim() || zipCode.length < 5) {
      newErrors.zipCode = 'Please enter a valid ZIP code';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep('processing');
    
    try {
      setProcessingMessage('Creating secure payment session...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const response = await apiRequest('POST', '/api/create-payment-intent', {
        amount,
        serviceId,
        serviceType,
      });
      
      const data = await response.json();
      
      if (!data.clientSecret) {
        throw new Error('Failed to create payment session');
      }
      
      setPaymentIntentId(data.paymentIntentId);
      setProcessingMessage('Verifying card details...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setProcessingMessage('Processing payment...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (formData) {
        setProcessingMessage('Creating service request...');
        await apiRequest('POST', '/api/service-requests', {
          serviceType,
          serviceId,
          formData,
          amount,
        });
      }
      
      setProcessingMessage('Confirming payment...');
      await apiRequest('POST', '/api/confirm-payment', {
        paymentIntentId: data.paymentIntentId,
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStep('success');
      successScale.value = withSequence(
        withTiming(1.2, { duration: 200 }),
        withSpring(1, { damping: 10, stiffness: 100 })
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
    } catch (error) {
      console.error('Payment error:', error);
      setStep('error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleClose = () => {
    if (step === 'success' && paymentIntentId) {
      onSuccess(paymentIntentId);
    }
    scaleAnim.value = withTiming(0.9, { duration: 150 });
    setTimeout(onClose, 150);
  };

  const getCardBrand = (number: string): string => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'American Express';
    if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
    return '';
  };

  const cardBrand = getCardBrand(cardNumber);

  const renderDetailsStep = () => (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.orderSummary}>
        <LinearGradient
          colors={serviceType === 'residential' ? FuturisticGradients.residential : FuturisticGradients.commercial}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summaryGradient}
        >
          <View style={styles.summaryHeader}>
            <Feather 
              name={serviceType === 'residential' ? 'home' : 'briefcase'} 
              size={24} 
              color="#fff" 
            />
            <ThemedText style={styles.summaryTitle}>{serviceName}</ThemedText>
          </View>
          {serviceDescription ? (
            <ThemedText style={styles.summaryDescription}>{serviceDescription}</ThemedText>
          ) : null}
          <View style={styles.amountContainer}>
            <ThemedText style={styles.amountLabel}>Total Amount</ThemedText>
            <ThemedText style={styles.amountValue}>${amount.toFixed(2)}</ThemedText>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.securityBadge}>
        <Feather name="shield" size={16} color={BrandColors.green} />
        <ThemedText style={[styles.securityText, { color: theme.textSecondary }]}>
          256-bit SSL Encrypted • Secure Payment
        </ThemedText>
      </View>

      <View style={styles.formSection}>
        <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
          💳 Card Information
        </ThemedText>

        <View style={styles.inputGroup}>
          <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
            Cardholder Name
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.inputBackground, color: theme.text, borderColor: errors.cardholderName ? '#ef4444' : theme.border }
            ]}
            placeholder="John Doe"
            placeholderTextColor={theme.textSecondary}
            value={cardholderName}
            onChangeText={setCardholderName}
            autoCapitalize="words"
          />
          {errors.cardholderName ? (
            <ThemedText style={styles.errorText}>{errors.cardholderName}</ThemedText>
          ) : null}
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
            Card Number
          </ThemedText>
          <View style={styles.cardInputWrapper}>
            <TextInput
              style={[
                styles.input,
                styles.cardInput,
                { backgroundColor: theme.inputBackground, color: theme.text, borderColor: errors.cardNumber ? '#ef4444' : theme.border }
              ]}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor={theme.textSecondary}
              value={cardNumber}
              onChangeText={(text) => setCardNumber(formatCardNumber(text))}
              keyboardType="numeric"
              maxLength={19}
            />
            {cardBrand ? (
              <View style={styles.cardBrandBadge}>
                <ThemedText style={styles.cardBrandText}>{cardBrand}</ThemedText>
              </View>
            ) : null}
          </View>
          {errors.cardNumber ? (
            <ThemedText style={styles.errorText}>{errors.cardNumber}</ThemedText>
          ) : null}
        </View>

        <View style={styles.rowInputs}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: Spacing.sm }]}>
            <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Expiry Date
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.inputBackground, color: theme.text, borderColor: errors.expiry ? '#ef4444' : theme.border }
              ]}
              placeholder="MM/YY"
              placeholderTextColor={theme.textSecondary}
              value={expiry}
              onChangeText={(text) => setExpiry(formatExpiry(text))}
              keyboardType="numeric"
              maxLength={5}
            />
            {errors.expiry ? (
              <ThemedText style={styles.errorText}>{errors.expiry}</ThemedText>
            ) : null}
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: Spacing.sm }]}>
            <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
              CVC
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.inputBackground, color: theme.text, borderColor: errors.cvc ? '#ef4444' : theme.border }
              ]}
              placeholder="123"
              placeholderTextColor={theme.textSecondary}
              value={cvc}
              onChangeText={(text) => setCvc(text.replace(/\D/g, '').substring(0, 4))}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />
            {errors.cvc ? (
              <ThemedText style={styles.errorText}>{errors.cvc}</ThemedText>
            ) : null}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
            Billing ZIP Code
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.inputBackground, color: theme.text, borderColor: errors.zipCode ? '#ef4444' : theme.border }
            ]}
            placeholder="30032"
            placeholderTextColor={theme.textSecondary}
            value={zipCode}
            onChangeText={(text) => setZipCode(text.replace(/\D/g, '').substring(0, 5))}
            keyboardType="numeric"
            maxLength={5}
          />
          {errors.zipCode ? (
            <ThemedText style={styles.errorText}>{errors.zipCode}</ThemedText>
          ) : null}
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.payButton,
          pressed && styles.payButtonPressed,
        ]}
        onPress={handlePayment}
      >
        <LinearGradient
          colors={[BrandColors.blue, '#1976D2', BrandColors.green]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.payButtonGradient}
        >
          <Feather name="lock" size={20} color="#fff" />
          <Text style={styles.payButtonText}>
            Pay ${amount.toFixed(2)} Securely
          </Text>
        </LinearGradient>
      </Pressable>

      <View style={styles.paymentMethods}>
        <ThemedText style={[styles.paymentMethodsText, { color: theme.textSecondary }]}>
          We accept Visa, Mastercard, American Express, and Discover
        </ThemedText>
      </View>
    </ScrollView>
  );

  const renderProcessingStep = () => (
    <View style={styles.processingContainer}>
      <View style={styles.processingIconContainer}>
        <LinearGradient
          colors={[BrandColors.blue, BrandColors.green]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.processingIconGradient}
        >
          <ActivityIndicator size="large" color="#fff" />
        </LinearGradient>
      </View>
      <ThemedText style={[styles.processingTitle, { color: theme.text }]}>
        Processing Payment
      </ThemedText>
      <ThemedText style={[styles.processingMessage, { color: theme.textSecondary }]}>
        {processingMessage}
      </ThemedText>
      <View style={styles.processingSteps}>
        <View style={styles.processingStep}>
          <Feather name="check-circle" size={16} color={BrandColors.green} />
          <ThemedText style={[styles.processingStepText, { color: theme.textSecondary }]}>
            Card verified
          </ThemedText>
        </View>
        <View style={styles.processingStep}>
          <ActivityIndicator size="small" color={BrandColors.blue} />
          <ThemedText style={[styles.processingStepText, { color: theme.textSecondary }]}>
            Authorizing payment
          </ThemedText>
        </View>
      </View>
      <ThemedText style={[styles.secureNote, { color: theme.textSecondary }]}>
        🔒 Your payment is being processed securely
      </ThemedText>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.successContainer}>
      <Animated.View style={[styles.successIconContainer, successAnimatedStyle]}>
        <LinearGradient
          colors={[BrandColors.green, '#43A047']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.successIconGradient}
        >
          <Feather name="check" size={48} color="#fff" />
        </LinearGradient>
      </Animated.View>
      <ThemedText style={[styles.successTitle, { color: theme.text }]}>
        Payment Successful! 🎉
      </ThemedText>
      <ThemedText style={[styles.successMessage, { color: theme.textSecondary }]}>
        Your payment of ${amount.toFixed(2)} has been processed successfully.
      </ThemedText>
      <View style={styles.successDetails}>
        <View style={styles.successDetailRow}>
          <ThemedText style={[styles.successDetailLabel, { color: theme.textSecondary }]}>
            Service:
          </ThemedText>
          <ThemedText style={[styles.successDetailValue, { color: theme.text }]}>
            {serviceName}
          </ThemedText>
        </View>
        <View style={styles.successDetailRow}>
          <ThemedText style={[styles.successDetailLabel, { color: theme.textSecondary }]}>
            Amount Paid:
          </ThemedText>
          <ThemedText style={[styles.successDetailValue, { color: BrandColors.green }]}>
            ${amount.toFixed(2)}
          </ThemedText>
        </View>
        <View style={styles.successDetailRow}>
          <ThemedText style={[styles.successDetailLabel, { color: theme.textSecondary }]}>
            Status:
          </ThemedText>
          <ThemedText style={[styles.successDetailValue, { color: BrandColors.green }]}>
            ✓ Confirmed
          </ThemedText>
        </View>
      </View>
      <ThemedText style={[styles.emailNote, { color: theme.textSecondary }]}>
        📧 A confirmation email will be sent to your registered email address.
      </ThemedText>
      <Pressable
        style={({ pressed }) => [
          styles.doneButton,
          pressed && styles.doneButtonPressed,
        ]}
        onPress={handleClose}
      >
        <LinearGradient
          colors={[BrandColors.green, '#43A047']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.doneButtonGradient}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );

  const renderErrorStep = () => (
    <View style={styles.errorContainer}>
      <View style={styles.errorIconContainer}>
        <Feather name="alert-circle" size={48} color="#ef4444" />
      </View>
      <ThemedText style={[styles.errorTitle, { color: theme.text }]}>
        Payment Failed
      </ThemedText>
      <ThemedText style={[styles.errorMessage, { color: theme.textSecondary }]}>
        We couldn't process your payment. Please check your card details and try again.
      </ThemedText>
      <View style={styles.errorActions}>
        <Pressable
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.retryButtonPressed,
          ]}
          onPress={() => setStep('details')}
        >
          <LinearGradient
            colors={[BrandColors.blue, '#1976D2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.retryButtonGradient}
          >
            <Feather name="refresh-cw" size={18} color="#fff" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </LinearGradient>
        </Pressable>
        <Pressable
          style={[styles.cancelButton, { borderColor: theme.border }]}
          onPress={handleClose}
        >
          <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
        </Pressable>
      </View>
      <ThemedText style={[styles.helpText, { color: theme.textSecondary }]}>
        Need help? Call (404) 294-2900
      </ThemedText>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.modalContainer, 
            { backgroundColor: theme.card, paddingBottom: insets.bottom + Spacing.md },
            animatedStyle
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Feather name="credit-card" size={24} color={BrandColors.blue} />
              <ThemedText style={[styles.headerTitle, { color: theme.text }]}>
                Secure Payment
              </ThemedText>
            </View>
            {step !== 'processing' ? (
              <Pressable style={styles.closeButton} onPress={handleClose}>
                <Feather name="x" size={24} color={theme.textSecondary} />
              </Pressable>
            ) : null}
          </View>

          {step === 'details' && renderDetailsStep()}
          {step === 'processing' && renderProcessingStep()}
          {step === 'success' && renderSuccessStep()}
          {step === 'error' && renderErrorStep()}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  closeButton: {
    padding: Spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  orderSummary: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  summaryGradient: {
    padding: Spacing.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  summaryTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  summaryDescription: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: Spacing.md,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  amountLabel: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.9)',
  },
  amountValue: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: '#fff',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  securityText: {
    fontSize: FontSizes.xs,
  },
  formSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.xs,
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.md,
  },
  cardInputWrapper: {
    position: 'relative',
  },
  cardInput: {
    paddingRight: 80,
  },
  cardBrandBadge: {
    position: 'absolute',
    right: Spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  cardBrandText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: BrandColors.blue,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  errorText: {
    fontSize: FontSizes.xs,
    color: '#ef4444',
    marginTop: Spacing.xs,
  },
  payButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  payButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  payButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  payButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: '#fff',
  },
  paymentMethods: {
    alignItems: 'center',
  },
  paymentMethodsText: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
  },
  processingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  processingIconContainer: {
    marginBottom: Spacing.lg,
  },
  processingIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  processingMessage: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  processingSteps: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  processingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  processingStepText: {
    fontSize: FontSizes.sm,
  },
  secureNote: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
  },
  successContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: Spacing.lg,
  },
  successIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  successMessage: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  successDetails: {
    width: '100%',
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  successDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  successDetailLabel: {
    fontSize: FontSizes.sm,
  },
  successDetailValue: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  emailNote: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  doneButton: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  doneButtonPressed: {
    opacity: 0.9,
  },
  doneButtonGradient: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: '#fff',
  },
  errorContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  errorIconContainer: {
    marginBottom: Spacing.lg,
  },
  errorTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  errorActions: {
    width: '100%',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  retryButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  retryButtonPressed: {
    opacity: 0.9,
  },
  retryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  retryButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: '#fff',
  },
  cancelButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  helpText: {
    fontSize: FontSizes.sm,
  },
});
