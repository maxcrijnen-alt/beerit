import { z } from "zod";
import {
  GAME_ACTIVITY_KINDS,
  GAME_CARD_TYPES,
  GAME_CATEGORIES,
  GAME_INTENSITIES,
  GAME_VISIBILITIES,
  TIMER_BEHAVIORS,
} from "@/types/database";

export const gameEditorCardSchema = z
  .object({
    activityKind: z.enum(GAME_ACTIVITY_KINDS).nullable(),
    beeritsValue: z.number().int().min(0).max(20),
    cardType: z.enum(GAME_CARD_TYPES),
    intensity: z.enum(GAME_INTENSITIES),
    text: z.string().trim().min(1, "Enter the card text.").max(600),
    timerBehavior: z.enum(TIMER_BEHAVIORS),
    timerMaxSeconds: z.number().int().min(5).max(300).nullable(),
    timerMinSeconds: z.number().int().min(5).max(300).nullable(),
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
        ? values.timerBehavior === "FIXED"
          ? values.timerSeconds !== null
          : values.timerSeconds === null
        : values.timerBehavior === "FIXED" && values.timerSeconds === null,
    {
      message: "Choose a fixed timer only for fixed timed event cards.",
      path: ["timerSeconds"],
    },
  )
  .refine(
    (values) =>
      values.cardType === "TIMED_EVENT" && values.timerBehavior === "RANDOM_BOMB"
        ? values.timerMinSeconds !== null && values.timerMaxSeconds !== null
        : values.timerMinSeconds === null && values.timerMaxSeconds === null,
    {
      message: "Choose a random timer range only for Bomb Mode cards.",
      path: ["timerMinSeconds"],
    },
  )
  .refine(
    (values) =>
      values.timerMinSeconds === null ||
      values.timerMaxSeconds === null ||
      values.timerMaxSeconds >= values.timerMinSeconds,
    {
      message: "Maximum timer must be at least the minimum.",
      path: ["timerMaxSeconds"],
    },
  );

export const communityGameCardSchema = z.object({
  gameId: z.string().uuid(),
  intensity: z.enum(GAME_INTENSITIES),
  text: z.string().trim().min(1, "Enter your question.").max(600),
  topicId: z.string().uuid().nullable().optional(),
});

export const createGameTopicSchema = z.object({
  description: z.string().trim().max(240, "Use at most 240 characters.").optional(),
  gameId: z.string().uuid(),
  isSpicy: z.boolean().optional(),
  title: z.string().trim().min(2, "Use at least 2 characters.").max(40),
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
export type CreateGameTopicValues = z.infer<typeof createGameTopicSchema>;
export type NewGameCardsValues = z.infer<typeof newGameCardsSchema>;
export type UpdateGameConceptValues = z.infer<typeof updateGameConceptSchema>;

function normalizeGameCardPayload(card: unknown) {
  if (!card || typeof card !== "object") {
    return card;
  }

  const values = card as Record<string, unknown>;
  const cardType = values.cardType;
  const timerBehavior =
    cardType === "TIMED_EVENT" && values.timerBehavior === "RANDOM_BOMB"
      ? "RANDOM_BOMB"
      : "FIXED";
  const timerMinSeconds =
    typeof values.timerMinSeconds === "number" ? values.timerMinSeconds : 20;
  const timerMaxSeconds =
    typeof values.timerMaxSeconds === "number"
      ? Math.max(values.timerMaxSeconds, timerMinSeconds)
      : Math.max(180, timerMinSeconds);

  return {
    ...values,
    activityKind: cardType === "ACTIVITY" ? values.activityKind || "OTHER" : null,
    timerBehavior,
    timerMaxSeconds:
      cardType === "TIMED_EVENT" && timerBehavior === "RANDOM_BOMB"
        ? timerMaxSeconds
        : null,
    timerMinSeconds:
      cardType === "TIMED_EVENT" && timerBehavior === "RANDOM_BOMB"
        ? timerMinSeconds
        : null,
    timerSeconds:
      cardType === "TIMED_EVENT" && timerBehavior === "FIXED"
        ? values.timerSeconds === "" || values.timerSeconds == null
          ? 20
          : values.timerSeconds
        : null,
  };
}

export function normalizeGameCardsPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const values = payload as Record<string, unknown>;

  if (!Array.isArray(values.cards)) {
    return payload;
  }

  return {
    ...values,
    cards: values.cards.map(normalizeGameCardPayload),
  };
}
