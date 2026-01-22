import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { eq, desc, and, or, isNull } from "drizzle-orm";
import crypto from "crypto";
import { db } from "./db";
import { users, serviceRequests, userAddresses, transactions, feedback, chatConversations, chatMessages, insertUserSchema, loginSchema, insertServiceRequestSchema } from "@shared/schema";
import { stripeService } from "./stripeService";
import { stripeStorage } from "./stripeStorage";
import { getStripePublishableKey } from "./stripeClient";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/register", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid registration data" });
      }

      const { email, password, firstName, lastName, phone, serviceAddress } = result.data;

      const existingUser = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
      if (existingUser.length > 0) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }

      const hashedPassword = hashPassword(password);
      const [user] = await db.insert(users).values({
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        serviceAddress,
      }).returning();

      const token = generateToken();

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          serviceAddress: user.serviceAddress,
        },
        token,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed. Please try again." });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const { email, password } = result.data;
      const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const hashedPassword = hashPassword(password);
      if (user.password !== hashedPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = generateToken();

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          serviceAddress: user.serviceAddress,
        },
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed. Please try again." });
    }
  });

  app.get("/api/stripe/publishable-key", async (_req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Error getting publishable key:", error);
      res.status(500).json({ message: "Failed to get Stripe key" });
    }
  });

  app.post("/api/service-requests", async (req, res) => {
    try {
      const { userId, serviceType, serviceId, formData, amount } = req.body;

      const [request] = await db.insert(serviceRequests).values({
        userId,
        serviceType,
        serviceId,
        formData,
        amount,
        status: amount && amount > 0 ? "pending_payment" : "submitted",
      }).returning();

      res.json({ request, message: "Service request submitted successfully" });
    } catch (error) {
      console.error("Service request error:", error);
      res.status(500).json({ message: "Failed to submit service request" });
    }
  });

  app.get("/api/service-requests/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const requests = await db.select().from(serviceRequests).where(eq(serviceRequests.userId, userId));
      res.json({ requests });
    } catch (error) {
      console.error("Error fetching service requests:", error);
      res.status(500).json({ message: "Failed to fetch service requests" });
    }
  });

  app.post("/api/quick-service-requests", async (req, res) => {
    try {
      const { type, subType, address, problemDescription, callbackNumber, status } = req.body;

      const serviceTypeMap: Record<string, string> = {
        "missed-collection": "Quick Service - Missed Collection",
        "service-day-inquiry": "Quick Service - Service Day Inquiry",
        "account-number-request": "Quick Service - Account Number Request",
        "supervisor-callback": "Quick Service - Supervisor Callback",
      };

      const [request] = await db.insert(serviceRequests).values({
        userId: null,
        serviceType: serviceTypeMap[type] || `Quick Service - ${type}`,
        serviceId: `quick-${type}`,
        formData: {
          type,
          subType,
          address,
          problemDescription,
          callbackNumber,
          submittedAt: new Date().toISOString(),
        },
        amount: 0,
        status: status || "submitted",
      }).returning();

      res.json({ 
        request, 
        message: "Quick service request submitted successfully",
        estimatedResponse: type === "missed-collection" ? "1-2 business days" : "24 hours"
      });
    } catch (error) {
      console.error("Quick service request error:", error);
      res.status(500).json({ message: "Failed to submit quick service request" });
    }
  });

  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, serviceId, serviceType, userId } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const paymentIntent = await stripeService.createPaymentIntent(
        Math.round(amount * 100),
        "usd",
        { serviceId, serviceType, userId: userId || "guest" }
      );

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error) {
      console.error("Payment intent error:", error);
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  app.post("/api/confirm-payment", async (req, res) => {
    try {
      const { paymentIntentId, serviceRequestId } = req.body;

      if (serviceRequestId) {
        await db.update(serviceRequests)
          .set({
            paymentIntentId,
            status: "paid",
            updatedAt: new Date(),
          })
          .where(eq(serviceRequests.id, serviceRequestId));
      }

      res.json({ success: true, message: "Payment confirmed successfully" });
    } catch (error) {
      console.error("Confirm payment error:", error);
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });

  app.get("/api/products", async (_req, res) => {
    try {
      const products = await stripeStorage.listProducts();
      res.json({ data: products });
    } catch (error) {
      console.error("Products error:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products-with-prices", async (_req, res) => {
    try {
      const rows = await stripeStorage.listProductsWithPrices();

      const productsMap = new Map();
      for (const row of rows as any[]) {
        if (!productsMap.has(row.product_id)) {
          productsMap.set(row.product_id, {
            id: row.product_id,
            name: row.product_name,
            description: row.product_description,
            active: row.product_active,
            prices: []
          });
        }
        if (row.price_id) {
          productsMap.get(row.product_id).prices.push({
            id: row.price_id,
            unit_amount: row.unit_amount,
            currency: row.currency,
            recurring: row.recurring,
            active: row.price_active,
          });
        }
      }

      res.json({ data: Array.from(productsMap.values()) });
    } catch (error) {
      console.error("Products with prices error:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // User Addresses endpoints
  app.get("/api/addresses", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }

      const addresses = await db
        .select()
        .from(userAddresses)
        .where(eq(userAddresses.userId, userId))
        .orderBy(desc(userAddresses.createdAt));

      res.json(addresses);
    } catch (error) {
      console.error("Get addresses error:", error);
      res.status(500).json({ message: "Failed to fetch addresses" });
    }
  });

  app.post("/api/addresses", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }

      const { street, apt, city, state, zip } = req.body;
      if (!street || !city || !zip) {
        return res.status(400).json({ message: "Street, city, and ZIP are required" });
      }

      const [address] = await db.insert(userAddresses).values({
        userId,
        street,
        apt,
        city,
        state: state || "GA",
        zip,
        isDefault: false,
      }).returning();

      res.json(address);
    } catch (error) {
      console.error("Add address error:", error);
      res.status(500).json({ message: "Failed to add address" });
    }
  });

  app.delete("/api/addresses/:id", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }

      const { id } = req.params;
      await db.delete(userAddresses).where(eq(userAddresses.id, id));

      res.json({ message: "Address deleted" });
    } catch (error) {
      console.error("Delete address error:", error);
      res.status(500).json({ message: "Failed to delete address" });
    }
  });

  // Service Requests endpoints
  app.get("/api/service-requests", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }

      const requests = await db
        .select()
        .from(serviceRequests)
        .where(eq(serviceRequests.userId, userId))
        .orderBy(desc(serviceRequests.createdAt));

      res.json(requests);
    } catch (error) {
      console.error("Get service requests error:", error);
      res.status(500).json({ message: "Failed to fetch service requests" });
    }
  });

  // Transactions endpoints
  app.get("/api/transactions", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }

      const txns = await db
        .select()
        .from(transactions)
        .where(eq(transactions.userId, userId))
        .orderBy(desc(transactions.createdAt));

      res.json(txns);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Feedback endpoint
  app.post("/api/feedback", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      const { experienceRating, accessibilityRating, feedback: feedbackText } = req.body;

      if (!experienceRating || !accessibilityRating) {
        return res.status(400).json({ message: "Ratings are required" });
      }

      const [newFeedback] = await db.insert(feedback).values({
        userId: userId || null,
        experienceRating,
        accessibilityRating,
        feedback: feedbackText || null,
      }).returning();

      res.json(newFeedback);
    } catch (error) {
      console.error("Submit feedback error:", error);
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  // ===== CHAT API ENDPOINTS =====

  // Create or get existing conversation for a visitor
  app.post("/api/chat/conversations", async (req, res) => {
    try {
      const { visitorId, userId, visitorName, visitorEmail } = req.body;
      
      if (!visitorId) {
        return res.status(400).json({ message: "Visitor ID is required" });
      }

      // Check for existing active conversation
      const [existing] = await db.select()
        .from(chatConversations)
        .where(and(
          eq(chatConversations.visitorId, visitorId),
          eq(chatConversations.status, "active")
        ));

      if (existing) {
        return res.json({ conversation: existing });
      }

      // Create new conversation
      const [conversation] = await db.insert(chatConversations).values({
        visitorId,
        userId: userId || null,
        visitorName: visitorName || null,
        visitorEmail: visitorEmail || null,
        status: "active",
      }).returning();

      res.json({ conversation });
    } catch (error) {
      console.error("Create conversation error:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  // Get messages for a conversation
  app.get("/api/chat/conversations/:conversationId/messages", async (req, res) => {
    try {
      const { conversationId } = req.params;
      
      const messages = await db.select()
        .from(chatMessages)
        .where(eq(chatMessages.conversationId, conversationId))
        .orderBy(chatMessages.createdAt);

      res.json({ messages });
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Failed to get messages" });
    }
  });

  // Send a message
  app.post("/api/chat/messages", async (req, res) => {
    try {
      const { conversationId, senderId, senderType, message } = req.body;

      if (!conversationId || !senderId || !senderType || !message) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const [newMessage] = await db.insert(chatMessages).values({
        conversationId,
        senderId,
        senderType,
        message,
      }).returning();

      // Update conversation timestamp
      await db.update(chatConversations)
        .set({ updatedAt: new Date() })
        .where(eq(chatConversations.id, conversationId));

      res.json({ message: newMessage });
    } catch (error) {
      console.error("Send message error:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // ===== ADMIN API ENDPOINTS =====

  // Get all conversations for admin
  app.get("/api/admin/conversations", async (req, res) => {
    try {
      const conversations = await db.select()
        .from(chatConversations)
        .orderBy(desc(chatConversations.updatedAt));

      // Get last message for each conversation
      const conversationsWithLastMessage = await Promise.all(
        conversations.map(async (conv) => {
          const [lastMessage] = await db.select()
            .from(chatMessages)
            .where(eq(chatMessages.conversationId, conv.id))
            .orderBy(desc(chatMessages.createdAt))
            .limit(1);
          
          const unreadCount = await db.select()
            .from(chatMessages)
            .where(and(
              eq(chatMessages.conversationId, conv.id),
              eq(chatMessages.senderType, "user"),
              eq(chatMessages.isRead, false)
            ));

          return {
            ...conv,
            lastMessage,
            unreadCount: unreadCount.length,
          };
        })
      );

      res.json({ conversations: conversationsWithLastMessage });
    } catch (error) {
      console.error("Get admin conversations error:", error);
      res.status(500).json({ message: "Failed to get conversations" });
    }
  });

  // Mark messages as read
  app.post("/api/admin/conversations/:conversationId/read", async (req, res) => {
    try {
      const { conversationId } = req.params;

      await db.update(chatMessages)
        .set({ isRead: true })
        .where(and(
          eq(chatMessages.conversationId, conversationId),
          eq(chatMessages.senderType, "user")
        ));

      res.json({ success: true });
    } catch (error) {
      console.error("Mark read error:", error);
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });

  // Get all service requests for admin
  app.get("/api/admin/requests", async (req, res) => {
    try {
      const { status } = req.query;
      
      let requests;
      if (status && status !== "all") {
        requests = await db.select()
          .from(serviceRequests)
          .where(eq(serviceRequests.status, status as string))
          .orderBy(desc(serviceRequests.createdAt));
      } else {
        requests = await db.select()
          .from(serviceRequests)
          .orderBy(desc(serviceRequests.createdAt));
      }

      // Get user info for each request
      const requestsWithUser = await Promise.all(
        requests.map(async (request) => {
          let user = null;
          if (request.userId) {
            const [userRecord] = await db.select({
              firstName: users.firstName,
              lastName: users.lastName,
              email: users.email,
              phone: users.phone,
            })
            .from(users)
            .where(eq(users.id, request.userId));
            user = userRecord;
          }
          return { ...request, user };
        })
      );

      res.json({ requests: requestsWithUser });
    } catch (error) {
      console.error("Get admin requests error:", error);
      res.status(500).json({ message: "Failed to get requests" });
    }
  });

  // Update request status
  app.patch("/api/admin/requests/:requestId/status", async (req, res) => {
    try {
      const { requestId } = req.params;
      const { status } = req.body;

      const [updated] = await db.update(serviceRequests)
        .set({ status, updatedAt: new Date() })
        .where(eq(serviceRequests.id, requestId))
        .returning();

      res.json({ request: updated });
    } catch (error) {
      console.error("Update request status error:", error);
      res.status(500).json({ message: "Failed to update request status" });
    }
  });

  // Respond to a service request
  app.post("/api/admin/requests/:requestId/respond", async (req, res) => {
    try {
      const { requestId } = req.params;
      const { response, newStatus } = req.body;

      const [updated] = await db.update(serviceRequests)
        .set({ 
          adminResponse: response,
          adminRespondedAt: new Date(),
          status: newStatus || "responded",
          updatedAt: new Date(),
        })
        .where(eq(serviceRequests.id, requestId))
        .returning();

      res.json({ request: updated });
    } catch (error) {
      console.error("Respond to request error:", error);
      res.status(500).json({ message: "Failed to respond to request" });
    }
  });

  // Close a conversation
  app.patch("/api/admin/conversations/:conversationId/close", async (req, res) => {
    try {
      const { conversationId } = req.params;

      const [updated] = await db.update(chatConversations)
        .set({ status: "closed", updatedAt: new Date() })
        .where(eq(chatConversations.id, conversationId))
        .returning();

      res.json({ conversation: updated });
    } catch (error) {
      console.error("Close conversation error:", error);
      res.status(500).json({ message: "Failed to close conversation" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
