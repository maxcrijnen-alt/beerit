import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Use at least 3 characters.")
  .max(32, "Use at most 32 characters.")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Use only letters, numbers, and underscores.",
  )
  .transform((value) => value.toLowerCase());

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(6, "Use at least 6 characters."),
});

export const signupSchema = loginSchema.extend({
  username: usernameSchema,
});

export const guestSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Enter a display name.")
    .max(40, "Use at most 40 characters."),
});

export const profileSchema = z.object({
  avatarUrl: z
    .string()
    .trim()
    .url("Enter a valid URL.")
    .or(z.literal("")),
  bio: z.string().trim().max(280, "Use at most 280 characters."),
  username: usernameSchema,
});

export type GuestValues = z.input<typeof guestSchema>;
export type LoginValues = z.input<typeof loginSchema>;
export type ProfileValues = z.input<typeof profileSchema>;
export type SignupValues = z.input<typeof signupSchema>;
