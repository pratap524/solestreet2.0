import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  street: z.string().min(5, "Street address is required"),
  apartment: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State / Province is required"),
  zipCode: z.string().min(4, "Postal / ZIP code is required"),
  country: z.string().min(2, "Country is required"),
  phone: z.string().min(7, "Valid phone number is required"),
  isDefault: z.boolean().optional(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

export const customerInfoSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email address is required"),
  phone: z.string().min(7, "Valid phone number is required"),
});

export type CustomerInfoFormValues = z.infer<typeof customerInfoSchema>;

export const checkoutStep1Schema = customerInfoSchema;

export const checkoutStep2Schema = z.object({
  shippingAddress: addressSchema,
  sameAsBilling: z.boolean().default(true),
  billingAddress: addressSchema.optional(),
});

export const checkoutStep3Schema = z.object({
  shippingMethodId: z.enum(["standard", "express"]),
});

export const couponSchema = z.object({
  code: z.string().min(2, "Enter a valid code").toUpperCase(),
});
