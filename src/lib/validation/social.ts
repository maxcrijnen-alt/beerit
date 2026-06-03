import { z } from "zod";
import { GAME_REPORT_REASONS, GAME_VOTE_TYPES } from "@/types/database";

export const setGameVoteSchema = z.object({
  gameId: z.string().uuid(),
  voteType: z.enum(GAME_VOTE_TYPES),
});

export const setGameCardVoteSchema = z.object({
  gameCardId: z.string().uuid(),
  voteType: z.enum(GAME_VOTE_TYPES),
});

export const reportGameSchema = z.object({
  details: z.string().trim().max(1000, "Use at most 1000 characters."),
  gameId: z.string().uuid(),
  reason: z.enum(GAME_REPORT_REASONS),
});

export const toggleSavedGameSchema = z.object({
  gameId: z.string().uuid(),
});

export const moderateGameSchema = z.object({
  gameId: z.string().uuid(),
  hidden: z.enum(["true", "false"]).transform((value) => value === "true"),
});

export type ReportGameValues = z.infer<typeof reportGameSchema>;
