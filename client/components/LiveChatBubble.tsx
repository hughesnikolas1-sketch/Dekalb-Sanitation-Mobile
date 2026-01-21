import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { BrandColors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BUBBLE_POSITION = { right: 16, bottom: 20 };

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    text: "👋 Hi there! I'm your live DeKalb Sanitation assistant. How can I help you today?",
    sender: 'agent',
    timestamp: new Date(),
  },
  {
    id: '2', 
    text: "I can help you with service requests, billing questions, pickup schedules, and more. Just type your question below! 💬",
    sender: 'agent',
    timestamp: new Date(),
  },
];

const AGENT_RESPONSES = [
  "I understand! Let me look into that for you. One moment please... 🔍",
  "Great question! Our team typically responds within 1-2 business days. Is there anything else I can help with? 📋",
  "I've noted your concern. A representative will follow up with you shortly via email or phone. 📞",
  "Thank you for reaching out! Your satisfaction is our priority. 🌟",
  "I can definitely help with that! Let me connect you with the right department. 🤝",
  "That's a common question! Here's what you need to know... 📚",
];

export function LiveChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);
  const bounceY = useSharedValue(0);
  const floatX = useSharedValue(0);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 1200 }),
        withTiming(0.3, { duration: 1200 })
      ),
      -1,
      true
    );

    bounceY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(4, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    floatX.value = withRepeat(
      withSequence(
        withTiming(6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(-6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const bubbleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pulseScale.value },
      { translateY: bounceY.value },
      { translateX: floatX.value },
    ],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handleOpenChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsOpen(true);
  };

  const handleCloseChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsOpen(false);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    setTimeout(() => {
      setIsTyping(false);
      const randomResponse = AGENT_RESPONSES[Math.floor(Math.random() * AGENT_RESPONSES.length)];
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: 'agent',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, agentMessage]);
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1500 + Math.random() * 1000);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageBubble,
      item.sender === 'user' ? styles.userMessage : styles.agentMessage,
    ]}>
      {item.sender === 'agent' && (
        <View style={styles.agentAvatar}>
          <Feather name="headphones" size={16} color="#fff" />
        </View>
      )}
      <View style={[
        styles.messageContent,
        item.sender === 'user' ? styles.userMessageContent : styles.agentMessageContent,
      ]}>
        <Text style={[
          styles.messageText,
          item.sender === 'user' ? styles.userMessageText : styles.agentMessageText,
        ]}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <>
      <Pressable
        style={[
          styles.bubbleContainer, 
          { 
            bottom: BUBBLE_POSITION.bottom + insets.bottom,
            right: BUBBLE_POSITION.right,
          }
        ]}
        onPress={handleOpenChat}
      >
        <Animated.View style={[styles.glowEffect, glowAnimatedStyle]} />
        <Animated.View style={bubbleAnimatedStyle}>
          <LinearGradient
            colors={[BrandColors.blue, '#1976D2', BrandColors.green]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bubble}
          >
            <Feather name="message-circle" size={28} color="#fff" />
          </LinearGradient>
        </Animated.View>
        <View style={styles.tooltipContainer}>
          <View style={styles.tooltip}>
            <Text style={styles.tooltipText}>
              💬 Get stuck? Live agent ready to assist!
            </Text>
            <Text style={styles.tooltipSubtext}>
              Just click here - you can talk with a live agent while completing your request! 🤝
            </Text>
          </View>
          <View style={styles.tooltipArrow} />
        </View>
      </Pressable>

      <Modal
        visible={isOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseChat}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.chatContainer}
        >
          <LinearGradient
            colors={[BrandColors.blue, '#1976D2']}
            style={styles.chatHeader}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <View style={styles.agentAvatarLarge}>
                  <Feather name="headphones" size={24} color="#fff" />
                </View>
                <View>
                  <Text style={styles.headerTitle}>🎧 Live Agent Support</Text>
                  <View style={styles.onlineStatus}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.onlineText}>Online - Ready to help!</Text>
                  </View>
                </View>
              </View>
              <Pressable onPress={handleCloseChat} style={styles.closeButton}>
                <Feather name="x" size={24} color="#fff" />
              </Pressable>
            </View>
          </LinearGradient>

          <View style={styles.reassuranceBar}>
            <Text style={styles.reassuranceText}>
              ✨ You can continue your request - we'll chat alongside you!
            </Text>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {isTyping && (
            <View style={styles.typingIndicator}>
              <View style={styles.agentAvatar}>
                <Feather name="headphones" size={16} color="#fff" />
              </View>
              <View style={styles.typingDots}>
                <View style={[styles.dot, styles.dot1]} />
                <View style={[styles.dot, styles.dot2]} />
                <View style={[styles.dot, styles.dot3]} />
              </View>
            </View>
          )}

          <View style={[styles.inputContainer, { paddingBottom: insets.bottom + Spacing.sm }]}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your message..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <Pressable
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!inputText.trim()}
            >
              <LinearGradient
                colors={inputText.trim() ? [BrandColors.blue, BrandColors.green] : ['#ccc', '#ddd']}
                style={styles.sendButtonGradient}
              >
                <Feather name="send" size={20} color="#fff" />
              </LinearGradient>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bubbleContainer: {
    position: 'absolute',
    zIndex: 1000,
    alignItems: 'center',
  },
  glowEffect: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: BrandColors.blue,
  },
  bubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BrandColors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  tooltipContainer: {
    position: 'absolute',
    right: 75,
    top: 5,
    alignItems: 'flex-end',
  },
  tooltip: {
    backgroundColor: '#fff',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    maxWidth: SCREEN_WIDTH - 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  tooltipText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: BrandColors.blue,
  },
  tooltipSubtext: {
    fontSize: FontSizes.xs,
    color: '#666',
    marginTop: 2,
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
    position: 'absolute',
    right: -5,
    top: 20,
    transform: [{ rotate: '-90deg' }],
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  chatHeader: {
    paddingTop: 50,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  agentAvatarLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: '#fff',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  onlineText: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.9)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reassuranceBar: {
    backgroundColor: '#E8F5E9',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#C8E6C9',
  },
  reassuranceText: {
    fontSize: FontSizes.sm,
    color: BrandColors.green,
    textAlign: 'center',
    fontWeight: '500',
  },
  messagesList: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  agentMessage: {
    justifyContent: 'flex-start',
  },
  agentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BrandColors.blue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  messageContent: {
    maxWidth: '75%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  userMessageContent: {
    backgroundColor: BrandColors.blue,
    borderBottomRightRadius: 4,
  },
  agentMessageContent: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: FontSizes.md,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  agentMessageText: {
    color: '#333',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  typingDots: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: Spacing.sm,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSizes.md,
    color: '#333',
  },
  sendButton: {
    width: 44,
    height: 44,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
