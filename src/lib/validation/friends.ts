import { z } from "zod";

export const sendFriendRequestSchema = z.object({
  username: z.string().trim().toLowerCase().min(3).max(24),
});

export const respondFriendRequestSchema = z.object({
  accept: z.enum(["true", "false"]).transform((value) => value === "true"),
  friendshipId: z.string().uuid(),
});

export const removeFriendshipSchema = z.object({
  friendshipId: z.string().uuid(),
});

export const markFriendBalanceEvenSchema = z.object({
  friendshipId: z.string().uuid(),
});
