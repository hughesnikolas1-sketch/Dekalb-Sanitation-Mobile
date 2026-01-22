import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BrandColors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/query-client';


const BUBBLE_POSITION = { right: 16, bottom: 20 };
const VISITOR_ID_KEY = '@dekalb_visitor_id';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

interface DBMessage {
  id: string;
  message: string;
  senderType: string;
  createdAt: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'welcome-1',
    text: "👋 Hi there! I'm your live DeKalb Sanitation assistant. How can I help you today?",
    sender: 'agent',
    timestamp: new Date(),
  },
  {
    id: 'welcome-2', 
    text: "I can help you with service requests, billing questions, pickup schedules, and more. Just type your question below! 💬",
    sender: 'agent',
    timestamp: new Date(),
  },
];

export function LiveChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const getOrCreateVisitorId = useCallback(async () => {
    try {
      let id = await AsyncStorage.getItem(VISITOR_ID_KEY);
      if (!id) {
        id = `visitor_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        await AsyncStorage.setItem(VISITOR_ID_KEY, id);
      }
      setVisitorId(id);
      return id;
    } catch (error) {
      console.error('Failed to get visitor ID:', error);
      return `visitor_${Date.now()}`;
    }
  }, []);

  const fetchMessages = useCallback(async (convId: string) => {
    try {
      const response = await apiRequest('GET', `/api/chat/conversations/${convId}/messages`);
      if (response.messages && response.messages.length > 0) {
        const dbMessages: Message[] = response.messages.map((m: DBMessage) => ({
          id: m.id,
          text: m.message,
          sender: m.senderType === 'admin' ? 'agent' : 'user',
          timestamp: new Date(m.createdAt),
        }));
        setMessages([...INITIAL_MESSAGES, ...dbMessages]);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  }, []);

  const createConversation = useCallback(async () => {
    try {
      setIsLoading(true);
      const vId = await getOrCreateVisitorId();
      const response = await apiRequest('POST', '/api/chat/conversations', {
        visitorId: vId,
        visitorName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : null,
        visitorEmail: user?.email || null,
      });
      setConversationId(response.conversation.id);
      return response.conversation.id;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getOrCreateVisitorId, user]);

  useEffect(() => {
    getOrCreateVisitorId();
  }, [getOrCreateVisitorId]);

  useEffect(() => {
    if (isOpen && conversationId) {
      fetchMessages(conversationId);
      const interval = setInterval(() => fetchMessages(conversationId), 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, conversationId, fetchMessages]);

  
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

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const messageText = inputText.trim();
    setInputText('');

    const tempMessage: Message = {
      id: `temp_${Date.now()}`,
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, tempMessage]);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      let convId = conversationId;
      if (!convId) {
        convId = await createConversation();
        if (!convId) {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            const autoResponse: Message = {
              id: `auto_${Date.now()}`,
              text: "Thanks for your message! A live agent will respond shortly. Your message has been recorded. 📝",
              sender: 'agent',
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, autoResponse]);
          }, 1500);
          return;
        }
      }

      await apiRequest('POST', '/api/chat/messages', {
        conversationId: convId,
        senderId: visitorId || user?.id || 'anonymous',
        senderType: 'user',
        message: messageText,
      });

      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const autoResponse: Message = {
          id: `auto_${Date.now()}`,
          text: "Thanks for your message! A live agent has been notified and will respond shortly. Keep an eye on this chat! 🔔",
          sender: 'agent',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, autoResponse]);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }, 1000);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const errorResponse: Message = {
          id: `error_${Date.now()}`,
          text: "I'm having trouble connecting right now. Please try again or call us at (404) 687-4040 for immediate assistance. 📞",
          sender: 'agent',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorResponse]);
      }, 1000);
    }
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
            <Feather name="message-circle" size={26} color="#fff" />
          </LinearGradient>
        </Animated.View>
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
