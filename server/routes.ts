import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { db } from "./db";
import { users, serviceRequests, insertUserSchema, loginSchema, insertServiceRequestSchema } from "@shared/schema";
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

  const httpServer = createServer(app);

  return httpServer;
}
