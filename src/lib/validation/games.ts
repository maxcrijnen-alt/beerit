import { z } from "zod";
import {
  GAME_ACTIVITY_KINDS,
  GAME_CARD_TYPES,
  GAME_CATEGORIES,
  GAME_INTENSITIES,
  GAME_VISIBILITIES,
} from "@/types/database";

export const gameEditorCardSchema = z
  .object({
    activityKind: z.enum(GAME_ACTIVITY_KINDS).nullable(),
    beeritsValue: z.number().int().min(0).max(20),
    cardType: z.enum(GAME_CARD_TYPES),
    intensity: z.enum(GAME_INTENSITIES),
    text: z.string().trim().min(1, "Enter the card text.").max(600),
    timerSeconds: z.number().int().min(5).max(300).nullable(),
  })
  .refine(
    (values) =>
      values.cardType === "ACTIVITY"
        ? values.activityKind !== null
        : values.activityKind === null,
    {
      message: "Choose an activity kind only for activity cards.",
      path: ["activityKind"],
    },
  )
  .refine(
    (values) =>
      values.cardType === "TIMED_EVENT"
        ? values.timerSeconds !== null
        : values.timerSeconds === null,
    {
      message: "Choose a timer only for timed event cards.",
      path: ["timerSeconds"],
    },
  );

export const communityGameCardSchema = z.object({
  gameId: z.string().uuid(),
  intensity: z.enum(GAME_INTENSITIES),
  text: z.string().trim().min(1, "Enter your question.").max(600),
});

export const newGameCardsSchema = z.object({
  cards: z
    .array(gameEditorCardSchema)
    .min(1, "Add at least one card.")
    .max(50, "Add at most 50 cards at once."),
});

export const addGameCardsSchema = newGameCardsSchema.extend({
  gameId: z.string().uuid(),
});

export const updateGameConceptSchema = z.object({
  concept: z.string().trim().max(120, "Use at most 120 characters."),
  gameId: z.string().uuid(),
});

export const gameFormSchema = z
  .object({
    cards: z
      .array(gameEditorCardSchema)
      .min(1, "Add at least one card.")
      .max(100, "Use at most 100 cards in the MVP."),
    category: z.enum(GAME_CATEGORIES),
    concept: z.string().trim().max(120, "Use at most 120 characters."),
    description: z.string().trim().max(600).or(z.literal("")),
    estimatedDuration: z.number().int().min(1).max(240),
    intensity: z.enum(GAME_INTENSITIES),
    maxPlayers: z.number().int().min(1).max(100),
    minPlayers: z.number().int().min(1).max(100),
    remixedFromGameId: z.string().uuid().nullable(),
    rules: z.string().trim().max(3000).or(z.literal("")),
    rulesUrl: z
      .string()
      .trim()
      .url("Enter a valid HTTPS rules link.")
      .startsWith("https://")
      .or(z.literal("")),
    title: z.string().trim().min(3).max(100),
    visibility: z.enum(GAME_VISIBILITIES),
  })
  .refine((values) => values.maxPlayers >= values.minPlayers, {
    message: "Maximum players must be at least the minimum.",
    path: ["maxPlayers"],
  });

export type GameFormValues = z.infer<typeof gameFormSchema>;
export type CommunityGameCardValues = z.infer<typeof communityGameCardSchema>;
export type NewGameCardsValues = z.infer<typeof newGameCardsSchema>;
export type UpdateGameConceptValues = z.infer<typeof updateGameConceptSchema>;
