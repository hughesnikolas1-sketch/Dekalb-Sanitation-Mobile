import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Modal,
  Platform,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Spacing, BorderRadius, BrandColors, FuturisticGradients } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";

type TabType = "requests" | "chat";
type RequestStatus = "all" | "pending" | "submitted" | "in_progress" | "completed" | "responded";

interface ServiceRequest {
  id: string;
  serviceType: string;
  serviceId: string;
  status: string;
  formData: any;
  amount: number | null;
  adminResponse: string | null;
  adminRespondedAt: string | null;
  createdAt: string;
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
  } | null;
}

interface ChatConversation {
  id: string;
  visitorId: string;
  visitorName: string | null;
  visitorEmail: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    message: string;
    senderType: string;
    createdAt: string;
  };
  unreadCount: number;
}

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminDashboardScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>("requests");
  const [statusFilter, setStatusFilter] = useState<RequestStatus>("all");
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [responseText, setResponseText] = useState("");
  const [newMessageText, setNewMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await apiRequest("GET", `/api/admin/requests?status=${statusFilter}`);
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    }
  }, [statusFilter]);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await apiRequest("GET", "/api/admin/conversations");
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const res = await apiRequest("GET", `/api/chat/conversations/${conversationId}/messages`);
      const data = await res.json();
      setMessages(data.messages || []);
      await apiRequest("POST", `/api/admin/conversations/${conversationId}/read`);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchRequests(), fetchConversations()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchRequests, fetchConversations]);

  useEffect(() => {
    if (activeTab === "requests") {
      fetchRequests();
    } else {
      fetchConversations();
    }
  }, [activeTab, statusFilter, fetchRequests, fetchConversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      const interval = setInterval(() => fetchMessages(selectedConversation.id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation, fetchMessages]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchRequests(), fetchConversations()]);
    setRefreshing(false);
  };

  const handleRespondToRequest = async () => {
    if (!selectedRequest || !responseText.trim()) return;
    
    setIsSending(true);
    try {
      await apiRequest("POST", `/api/admin/requests/${selectedRequest.id}/respond`, {
        response: responseText,
        newStatus: "responded",
      });
      
      if (Platform.OS === "web") {
        window.alert("Response sent successfully!");
      } else {
        Alert.alert("Success", "Response sent successfully!");
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSelectedRequest(null);
      setResponseText("");
      fetchRequests();
    } catch (error) {
      console.error("Failed to respond:", error);
      if (Platform.OS === "web") {
        window.alert("Failed to send response");
      } else {
        Alert.alert("Error", "Failed to send response");
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      await apiRequest("PATCH", `/api/admin/requests/${requestId}/status`, { status: newStatus });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      fetchRequests();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessageText.trim()) return;
    
    setIsSending(true);
    try {
      await apiRequest("POST", "/api/chat/messages", {
        conversationId: selectedConversation.id,
        senderId: user?.id || "admin",
        senderType: "admin",
        message: newMessageText,
      });
      
      setNewMessageText("");
      fetchMessages(selectedConversation.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleCloseConversation = async (conversationId: string) => {
    try {
      await apiRequest("PATCH", `/api/admin/conversations/${conversationId}/close`);
      setSelectedConversation(null);
      fetchConversations();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Failed to close conversation:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "#FF9800";
      case "submitted": return BrandColors.blue;
      case "in_progress": return "#9C27B0";
      case "completed": return BrandColors.green;
      case "responded": return "#00BCD4";
      default: return theme.textSecondary;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderRequestItem = ({ item }: { item: ServiceRequest }) => (
    <Pressable
      style={[styles.requestCard, { backgroundColor: theme.backgroundSecondary }]}
      onPress={() => setSelectedRequest(item)}
    >
      <View style={styles.requestHeader}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + "20" }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          <ThemedText type="small" style={{ color: getStatusColor(item.status), textTransform: "capitalize" }}>
            {item.status.replace("_", " ")}
          </ThemedText>
        </View>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {formatDate(item.createdAt)}
        </ThemedText>
      </View>
      
      <ThemedText type="h4" style={{ color: theme.text, marginTop: Spacing.sm }}>
        {item.serviceType}
      </ThemedText>
      
      {item.user ? (
        <View style={styles.userInfo}>
          <Feather name="user" size={14} color={theme.textSecondary} />
          <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>
            {item.user.firstName} {item.user.lastName} - {item.user.email || item.user.phone}
          </ThemedText>
        </View>
      ) : null}
      
      {item.formData?.address ? (
        <View style={styles.userInfo}>
          <Feather name="map-pin" size={14} color={theme.textSecondary} />
          <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }} numberOfLines={1}>
            {item.formData.address}
          </ThemedText>
        </View>
      ) : null}
      
      {item.adminResponse ? (
        <View style={[styles.responsePreview, { backgroundColor: BrandColors.green + "15" }]}>
          <Feather name="message-circle" size={14} color={BrandColors.green} />
          <ThemedText type="small" style={{ color: BrandColors.green, marginLeft: Spacing.xs, flex: 1 }} numberOfLines={1}>
            Response sent
          </ThemedText>
        </View>
      ) : null}
      
      <View style={[styles.requestFooter, { borderTopWidth: 1, borderTopColor: theme.divider, marginTop: Spacing.md, paddingTop: Spacing.md }]}>
        <View style={[styles.reviewButton, { backgroundColor: BrandColors.blue + "15" }]}>
          <Feather name="eye" size={16} color={BrandColors.blue} />
          <ThemedText type="body" style={{ color: BrandColors.blue, marginLeft: Spacing.sm, fontWeight: "600" }}>
            Tap to Review & Respond
          </ThemedText>
        </View>
        <Feather name="chevron-right" size={20} color={BrandColors.blue} />
      </View>
    </Pressable>
  );

  const renderConversationItem = ({ item }: { item: ChatConversation }) => (
    <Pressable
      style={[styles.conversationCard, { backgroundColor: theme.backgroundSecondary }]}
      onPress={() => setSelectedConversation(item)}
    >
      <View style={styles.conversationHeader}>
        <View style={[styles.avatar, { backgroundColor: BrandColors.blue + "30" }]}>
          <Feather name="user" size={20} color={BrandColors.blue} />
        </View>
        <View style={{ flex: 1, marginLeft: Spacing.md }}>
          <View style={styles.conversationTitleRow}>
            <ThemedText type="h4" style={{ color: theme.text, flex: 1 }}>
              {item.visitorName || "Anonymous User"}
            </ThemedText>
            {item.unreadCount > 0 ? (
              <View style={styles.unreadBadge}>
                <ThemedText type="small" style={{ color: "#FFF", fontWeight: "bold" }}>
                  {item.unreadCount}
                </ThemedText>
              </View>
            ) : null}
            </View>
            {item.visitorEmail ? (
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {item.visitorEmail}
              </ThemedText>
            ) : null}
          </View>
        </View>
        
        {item.lastMessage ? (
          <View style={styles.lastMessageContainer}>
            <ThemedText type="body" style={{ color: theme.text }} numberOfLines={2}>
              {item.lastMessage.senderType === "admin" ? "You: " : ""}
              {item.lastMessage.message}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
              {formatDate(item.lastMessage.createdAt)}
            </ThemedText>
          </View>
        ) : null}
        
        <View style={[styles.statusRow, { borderTopColor: theme.divider }]}>
          <View style={[styles.statusBadge, { backgroundColor: item.status === "active" ? BrandColors.green + "20" : theme.textSecondary + "20" }]}>
            <View style={[styles.statusDot, { backgroundColor: item.status === "active" ? BrandColors.green : theme.textSecondary }]} />
            <ThemedText type="small" style={{ color: item.status === "active" ? BrandColors.green : theme.textSecondary }}>
              {item.status}
            </ThemedText>
          </View>
        </View>
      </Pressable>
  );

  const renderRequestModal = () => (
    <Modal
      visible={selectedRequest !== null}
      animationType="slide"
      transparent
      onRequestClose={() => setSelectedRequest(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.backgroundSecondary, marginTop: insets.top + 40 }]}>
          <View style={styles.modalHeader}>
            <ThemedText type="h3" style={{ color: theme.text, flex: 1 }}>Request Details</ThemedText>
            <Pressable onPress={() => setSelectedRequest(null)}>
              <Feather name="x" size={24} color={theme.textSecondary} />
            </Pressable>
          </View>
          
          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {selectedRequest && (
              <>
                <View style={[styles.detailSection, { borderBottomColor: theme.divider }]}>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>Service Type</ThemedText>
                  <ThemedText type="h4" style={{ color: BrandColors.blue, marginTop: Spacing.xs }}>
                    {selectedRequest.serviceType}
                  </ThemedText>
                </View>
                
                <View style={[styles.detailSection, { borderBottomColor: theme.divider }]}>
                  <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.sm }}>Update Status</ThemedText>
                  <View style={styles.statusActions}>
                    {[
                      { key: "pending", label: "⏳ Pending", color: "#FF9800" },
                      { key: "in_progress", label: "🔄 In Progress", color: "#9C27B0" },
                      { key: "completed", label: "✅ Completed", color: "#4CAF50" },
                    ].map((statusOption) => (
                      <Pressable
                        key={statusOption.key}
                        style={[
                          styles.statusButton,
                          { 
                            backgroundColor: selectedRequest.status === statusOption.key ? statusOption.color : "transparent",
                            borderColor: statusOption.color,
                            borderWidth: 2,
                          }
                        ]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          handleUpdateStatus(selectedRequest.id, statusOption.key);
                        }}
                      >
                        <ThemedText style={{ 
                          color: selectedRequest.status === statusOption.key ? "#FFF" : statusOption.color,
                          fontWeight: "600",
                          fontSize: 13,
                        }}>
                          {statusOption.label}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </View>
                
                {selectedRequest.user && (
                  <View style={[styles.detailSection, { borderBottomColor: theme.divider }]}>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>Customer</ThemedText>
                    <ThemedText type="body" style={{ color: theme.text, marginTop: Spacing.xs }}>
                      {selectedRequest.user.firstName} {selectedRequest.user.lastName}
                    </ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>
                      {selectedRequest.user.email}
                    </ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>
                      {selectedRequest.user.phone}
                    </ThemedText>
                  </View>
                )}
                
                {selectedRequest.formData && (
                  <View style={[styles.detailSection, { borderBottomColor: theme.divider }]}>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>Request Details</ThemedText>
                    {Object.entries(selectedRequest.formData).map(([key, value]) => {
                      const displayValue = typeof value === "object" && value !== null 
                        ? JSON.stringify(value, null, 2) 
                        : String(value || "N/A");
                      const formattedKey = key.replace(/([A-Z])/g, " $1").replace(/_/g, " ");
                      return (
                        <View key={key} style={styles.formDataRow}>
                          <ThemedText type="small" style={{ color: theme.textSecondary, textTransform: "capitalize", minWidth: 100 }}>
                            {formattedKey}:
                          </ThemedText>
                          <ThemedText type="body" style={{ color: theme.text, flex: 1, marginLeft: Spacing.sm }}>
                            {displayValue}
                          </ThemedText>
                        </View>
                      );
                    })}
                  </View>
                )}
                
                {selectedRequest.adminResponse && (
                  <View style={[styles.detailSection, { borderBottomColor: theme.divider, backgroundColor: BrandColors.green + "10" }]}>
                    <ThemedText type="small" style={{ color: BrandColors.green }}>Previous Response</ThemedText>
                    <ThemedText type="body" style={{ color: theme.text, marginTop: Spacing.sm }}>
                      {selectedRequest.adminResponse}
                    </ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                      Sent {formatDate(selectedRequest.adminRespondedAt || "")}
                    </ThemedText>
                  </View>
                )}
                
                <View style={styles.responseSection}>
                  <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.sm }}>
                    Send Response
                  </ThemedText>
                  <TextInput
                    style={[styles.responseInput, { backgroundColor: theme.backgroundSecondary, borderColor: theme.divider, color: theme.text }]}
                    placeholder="Type your response to the customer..."
                    placeholderTextColor={theme.textSecondary}
                    value={responseText}
                    onChangeText={setResponseText}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  <Pressable
                    style={[styles.sendButton, { opacity: responseText.trim() ? 1 : 0.5 }]}
                    onPress={handleRespondToRequest}
                    disabled={!responseText.trim() || isSending}
                  >
                    <LinearGradient
                      colors={FuturisticGradients.greenBlue as [string, string, ...string[]]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.sendButtonGradient}
                    >
                      {isSending ? (
                        <ActivityIndicator color="#FFF" size="small" />
                      ) : (
                        <>
                          <Feather name="send" size={18} color="#FFF" />
                          <ThemedText type="h4" style={{ color: "#FFF", marginLeft: Spacing.sm }}>Send Response</ThemedText>
                        </>
                      )}
                    </LinearGradient>
                  </Pressable>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderChatModal = () => (
    <Modal
      visible={selectedConversation !== null}
      animationType="slide"
      transparent
      onRequestClose={() => setSelectedConversation(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.chatModalContent, { backgroundColor: theme.backgroundSecondary, marginTop: insets.top + 20, marginBottom: insets.bottom + 20 }]}>
          <View style={[styles.chatHeader, { borderBottomColor: theme.divider }]}>
            <Pressable onPress={() => setSelectedConversation(null)}>
              <Feather name="arrow-left" size={24} color={theme.text} />
            </Pressable>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <ThemedText type="h4" style={{ color: theme.text }}>
                {selectedConversation?.visitorName || "Anonymous User"}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {selectedConversation?.visitorEmail || selectedConversation?.visitorId}
              </ThemedText>
            </View>
            {selectedConversation?.status === "active" && (
              <Pressable 
                style={[styles.closeConvButton, { borderColor: "#FF5722" }]}
                onPress={() => selectedConversation && handleCloseConversation(selectedConversation.id)}
              >
                <ThemedText type="small" style={{ color: "#FF5722" }}>Close Chat</ThemedText>
              </Pressable>
            )}
          </View>
          
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            inverted={false}
            renderItem={({ item }) => (
              <View style={[
                styles.messageBubble,
                item.senderType === "admin" ? styles.adminBubble : styles.userBubble,
                { backgroundColor: item.senderType === "admin" ? BrandColors.blue : theme.textSecondary + "30" }
              ]}>
                <ThemedText type="body" style={{ color: item.senderType === "admin" ? "#FFF" : theme.text }}>
                  {item.message}
                </ThemedText>
                <ThemedText type="small" style={{ color: item.senderType === "admin" ? "rgba(255,255,255,0.7)" : theme.textSecondary, marginTop: Spacing.xs, alignSelf: "flex-end" }}>
                  {formatDate(item.createdAt)}
                </ThemedText>
              </View>
            )}
          />
          
          <View style={[styles.chatInputContainer, { borderTopColor: theme.divider }]}>
            <TextInput
              style={[styles.chatInput, { backgroundColor: theme.backgroundSecondary, borderColor: theme.divider, color: theme.text }]}
              placeholder="Type a message..."
              placeholderTextColor={theme.textSecondary}
              value={newMessageText}
              onChangeText={setNewMessageText}
              multiline
            />
            <Pressable
              style={[styles.chatSendButton, { backgroundColor: newMessageText.trim() ? BrandColors.blue : theme.textSecondary }]}
              onPress={handleSendMessage}
              disabled={!newMessageText.trim() || isSending}
            >
              {isSending ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Feather name="send" size={20} color="#FFF" />
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BrandColors.blue} />
        <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
          Loading admin dashboard...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[BrandColors.blue, BrandColors.green] as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <ThemedText type="h2" style={{ color: "#FFF" }}>Admin Dashboard</ThemedText>
        <ThemedText type="body" style={{ color: "rgba(255,255,255,0.8)", marginTop: Spacing.xs }}>
          Manage requests and live chat
        </ThemedText>
      </LinearGradient>
      
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === "requests" && styles.activeTab]}
          onPress={() => setActiveTab("requests")}
        >
          <Feather name="inbox" size={20} color={activeTab === "requests" ? BrandColors.blue : theme.textSecondary} />
          <ThemedText type="body" style={{ color: activeTab === "requests" ? BrandColors.blue : theme.textSecondary, marginLeft: Spacing.sm }}>
            Requests
          </ThemedText>
          {requests.filter(r => r.status === "pending" || r.status === "submitted").length > 0 && (
            <View style={styles.tabBadge}>
              <ThemedText type="small" style={{ color: "#FFF", fontSize: 10 }}>
                {requests.filter(r => r.status === "pending" || r.status === "submitted").length}
              </ThemedText>
            </View>
          )}
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "chat" && styles.activeTab]}
          onPress={() => setActiveTab("chat")}
        >
          <Feather name="message-circle" size={20} color={activeTab === "chat" ? BrandColors.green : theme.textSecondary} />
          <ThemedText type="body" style={{ color: activeTab === "chat" ? BrandColors.green : theme.textSecondary, marginLeft: Spacing.sm }}>
            Live Chat
          </ThemedText>
          {conversations.reduce((acc, c) => acc + c.unreadCount, 0) > 0 && (
            <View style={[styles.tabBadge, { backgroundColor: BrandColors.green }]}>
              <ThemedText type="small" style={{ color: "#FFF", fontSize: 10 }}>
                {conversations.reduce((acc, c) => acc + c.unreadCount, 0)}
              </ThemedText>
            </View>
          )}
        </Pressable>
      </View>
      
      {activeTab === "requests" && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {(["all", "pending", "submitted", "in_progress", "responded", "completed"] as RequestStatus[]).map((status) => (
            <Pressable
              key={status}
              style={[
                styles.filterChip,
                { 
                  backgroundColor: statusFilter === status ? getStatusColor(status === "all" ? "pending" : status) : "transparent",
                  borderColor: getStatusColor(status === "all" ? "pending" : status),
                }
              ]}
              onPress={() => setStatusFilter(status)}
            >
              <ThemedText type="small" style={{ color: statusFilter === status ? "#FFF" : getStatusColor(status === "all" ? "pending" : status), textTransform: "capitalize" }}>
                {status === "all" ? "All" : status.replace("_", " ")}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      )}
      
      {activeTab === "requests" ? (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={renderRequestItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BrandColors.blue} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="inbox" size={60} color={theme.textSecondary} />
              <ThemedText type="h4" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
                No requests yet
              </ThemedText>
            </View>
          }
        />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversationItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BrandColors.blue} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="message-circle" size={60} color={theme.textSecondary} />
              <ThemedText type="h4" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
                No conversations yet
              </ThemedText>
            </View>
          }
        />
      )}
      
      {renderRequestModal()}
      {renderChatModal()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  activeTab: {
    backgroundColor: "rgba(21, 101, 192, 0.1)",
  },
  tabBadge: {
    backgroundColor: BrandColors.blue,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.xs,
    paddingHorizontal: 6,
  },
  filterContainer: {
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  requestCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  responsePreview: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  requestFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reviewButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  conversationCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  conversationHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  conversationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  unreadBadge: {
    backgroundColor: BrandColors.blue,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  lastMessageContainer: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  statusRow: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl * 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    flex: 1,
    marginHorizontal: Spacing.md,
    marginBottom: 40,
    borderRadius: BorderRadius.xl,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
  },
  modalScroll: {
    flex: 1,
  },
  detailSection: {
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  statusActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  statusButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  formDataRow: {
    flexDirection: "row",
    marginTop: Spacing.sm,
  },
  responseSection: {
    padding: Spacing.md,
  },
  responseInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  sendButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
  },
  chatModalContent: {
    flex: 1,
    marginHorizontal: Spacing.sm,
    borderRadius: BorderRadius.xl,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  closeConvButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: Spacing.md,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  userBubble: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  adminBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  chatInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: Spacing.md,
    borderTopWidth: 1,
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    maxHeight: 100,
    fontSize: 16,
  },
  chatSendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.sm,
  },
});
