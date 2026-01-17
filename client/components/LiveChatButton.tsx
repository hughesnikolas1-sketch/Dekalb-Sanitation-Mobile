import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  FadeInUp,
  FadeIn,
  Easing,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, FuturisticGradients } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Message {
  id: string;
  text: string;
  isAgent: boolean;
  timestamp: Date;
}

const agentResponses: Record<string, string> = {
  default: "Hello! 👋 I'm here to help with your sanitation needs. How can I assist you today? 🌿",
  pickup: "I can help schedule a pickup! 🚛 What type of waste do you need picked up - trash, recycling, or yard waste? 📦♻️🌿",
  billing: "For billing inquiries, I can check your account balance and recent payments. 💳 Would you like me to look that up? 📊",
  schedule: "Your regular pickup schedule is set! 📅 Trash on Monday, recycling on Wednesday, yard waste on the first Tuesday of each month. ✨",
  help: "I'm happy to help! 😊 You can ask me about:\n• Pickup schedules 📅\n• Billing questions 💳\n• Service requests 📋\n• Reporting issues ⚠️",
  thanks: "You're welcome! 😊 Is there anything else I can help you with today? 🌟",
};

function getAgentResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("pickup") || lower.includes("collection")) return agentResponses.pickup;
  if (lower.includes("bill") || lower.includes("pay") || lower.includes("charge")) return agentResponses.billing;
  if (lower.includes("schedule") || lower.includes("when")) return agentResponses.schedule;
  if (lower.includes("help") || lower.includes("what can")) return agentResponses.help;
  if (lower.includes("thank") || lower.includes("great") || lower.includes("awesome")) return agentResponses.thanks;
  return "I understand you're asking about: \"" + message + "\". Let me connect you with a specialist who can help! 🎯 In the meantime, is there anything else I can assist with? 💬";
}

export function LiveChatButton() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  const bounce = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 400, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 400, easing: Easing.bounce })
      ),
      -1,
      true
    );
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: bounce.value },
      { scale: pulse.value },
    ],
  }));

  const handleOpen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsOpen(true);
    if (messages.length === 0) {
      setMessages([
        {
          id: "1",
          text: agentResponses.default,
          isAgent: true,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isAgent: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    setTimeout(() => {
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getAgentResponse(inputText),
        isAgent: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMessage]);
    }, 1200);
  };

  return (
    <>
      <AnimatedPressable
        onPress={handleOpen}
        style={[styles.chatButton, buttonStyle]}
      >
        <LinearGradient
          colors={["#1565C0", "#1976D2", "#42A5F5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.chatButtonGradient}
        >
          <Feather name="message-circle" size={26} color="#FFFFFF" />
          <View style={styles.chatBadge}>
            <ThemedText style={{ fontSize: 12 }}>💬</ThemedText>
          </View>
        </LinearGradient>
      </AnimatedPressable>

      <Modal
        visible={isOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsOpen(false)}
      >
        <KeyboardAvoidingView
          style={[styles.chatContainer, { backgroundColor: theme.backgroundRoot }]}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={[styles.chatHeader, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={styles.chatHeaderLeft}>
              <View style={styles.agentAvatar}>
                <ThemedText style={{ fontSize: 24 }}>🤖</ThemedText>
              </View>
              <View>
                <ThemedText type="h4" style={{ color: theme.text }}>DeKalb Support</ThemedText>
                <ThemedText type="small" style={{ color: "#4CAF50" }}>● Online</ThemedText>
              </View>
            </View>
            <Pressable onPress={() => setIsOpen(false)}>
              <Feather name="x" size={24} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.messagesList}
            contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing.xl }}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd()}
          >
            {messages.map((message, index) => (
              <Animated.View
                key={message.id}
                entering={FadeInUp.delay(index * 50).duration(300)}
                style={[
                  styles.messageBubble,
                  message.isAgent ? styles.agentBubble : styles.userBubble,
                  {
                    backgroundColor: message.isAgent
                      ? theme.backgroundSecondary
                      : "#1565C0",
                  },
                ]}
              >
                {message.isAgent && (
                  <ThemedText style={{ fontSize: 16, marginBottom: 4 }}>🤖</ThemedText>
                )}
                <ThemedText
                  type="body"
                  style={{
                    color: message.isAgent ? theme.text : "#FFFFFF",
                    lineHeight: 22,
                  }}
                >
                  {message.text}
                </ThemedText>
              </Animated.View>
            ))}
          </ScrollView>

          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.backgroundSecondary,
                paddingBottom: insets.bottom + Spacing.md,
              },
            ]}
          >
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.backgroundDefault,
                  color: theme.text,
                  borderColor: theme.cardBorder,
                },
              ]}
              placeholder="Type your message... 💭"
              placeholderTextColor={theme.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
            />
            <Pressable onPress={handleSend} style={styles.sendButton}>
              <LinearGradient
                colors={FuturisticGradients.residential as [string, string, ...string[]]}
                style={styles.sendButtonGradient}
              >
                <Feather name="send" size={20} color="#FFFFFF" />
              </LinearGradient>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  chatButton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    zIndex: 100,
  },
  chatButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1565C0",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  chatBadge: {
    position: "absolute",
    top: -6,
    right: -6,
  },
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  chatHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  agentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  messagesList: {
    flex: 1,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  agentBubble: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  textInput: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    borderWidth: 1,
  },
  sendButton: {},
  sendButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
