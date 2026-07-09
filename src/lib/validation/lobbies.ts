import { z } from "zod";
import {
  GAME_ACTIVITY_KINDS,
  GAME_CATEGORIES,
  LOBBY_ACTIVITY_SELECTION_MODES,
  LOBBY_CONTROLS,
} from "@/types/database";

export const createLobbySchema = z
  .object({
    activityKinds: z.array(z.enum(GAME_ACTIVITY_KINDS)).max(4),
    activitySelectionMode: z.enum(LOBBY_ACTIVITY_SELECTION_MODES),
    gameId: z.string().uuid(),
    includeCommunityCards: z.boolean(),
    mixedCategories: z.array(z.enum(GAME_CATEGORIES)).max(GAME_CATEGORIES.length),
  })
  .refine(
    (values) =>
      values.activitySelectionMode !== "ONLY_SELECTED" ||
      values.activityKinds.length > 0,
    {
      message: "Choose at least one offline game type.",
      path: ["activityKinds"],
    },
  );

export const joinLobbySchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{6}$/, "Enter the six-character lobby code."),
});

export const controlLobbySchema = z.object({
  control: z.enum(LOBBY_CONTROLS),
  lobbyId: z.string().uuid(),
});

export const adjustBeeritsSchema = z.object({
  delta: z.coerce.number().int().min(-20).max(20).refine((value) => value !== 0),
  lobbyId: z.string().uuid(),
  playerId: z.string().uuid(),
});

export const scoreAndAdvanceLobbySchema = z.object({
  delta: z.coerce.number().int().min(1).max(20),
  lobbyId: z.string().uuid(),
  playerId: z.string().uuid(),
});

export const undoLastQuickResultSchema = z.object({
  lobbyId: z.string().uuid(),
});

export const sendLobbyMessageSchema = z.object({
  lobbyId: z.string().uuid(),
  message: z.string().trim().min(1).max(500),
});

export const leaveLobbySchema = z.object({
  lobbyId: z.string().uuid(),
});

export const setBalanceWeightSchema = z.object({
  lobbyId: z.string().uuid(),
  weight: z.coerce.number().int().min(0).max(3),
});

export const addSessionQuestionSchema = z.object({
  intensity: z.enum(["Soft", "Funny", "Spicy", "Chaos"]),
  lobbyId: z.string().uuid(),
  text: z.string().trim().min(1, "Enter your question.").max(600),
});

export const deleteSessionQuestionSchema = z.object({
  lobbyId: z.string().uuid(),
  questionId: z.string().uuid(),
});

export type JoinLobbyValues = z.infer<typeof joinLobbySchema>;
