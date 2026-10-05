import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  mongodbUri:
    process.env.MONGODB_URI ||
    "mongodb+srv://majorpratapsinghsisodiya_db_user:<db_password>@cluster0.nzwhgad.mongodb.net/solestreet?retryWrites=true&w=majority&appName=Cluster0",
  isMongoConfigured: () => {
    const uri = process.env.MONGODB_URI || "";
    return Boolean(uri && !uri.includes("<db_password>"));
  },
  freeShippingThreshold: 150,
  taxRate: 0.08,
  shippingMethods: [
    {
      id: "standard",
      name: "Standard Ground Delivery",
      price: 10,
      estimatedDays: "3-5 business days",
      description: "Free on orders over ₹150. Reliable door-to-door ground shipping.",
    },
    {
      id: "express",
      name: "Express Air Priority",
      price: 25,
      estimatedDays: "1-2 business days",
      description: "Fastest air shipping with guaranteed priority handling.",
    },
  ],
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
    isConfigured: () => Boolean(process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes("mock")),
  },
};
