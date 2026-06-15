import { z } from "zod";
import {
  DISCOVERY_CONTENT_MODES,
  DISCOVERY_POOLS,
  GAME_CATEGORIES,
  GAME_INTENSITIES,
} from "@/types/database";

export const pickRandomGameSchema = z.object({
  category: z.enum(["ALL", ...GAME_CATEGORIES]),
  contentMode: z.enum(DISCOVERY_CONTENT_MODES),
  durationMaxMinutes: z.number().int().min(1).max(240).nullable(),
  intensity: z.enum(["ALL", ...GAME_INTENSITIES]),
  players: z.number().int().min(1).max(100).nullable(),
  pool: z.enum(DISCOVERY_POOLS),
  query: z.string().trim().max(120),
  recentRandomGameIds: z.array(z.string().uuid()).max(50),
});

export type PickRandomGameValues = z.infer<typeof pickRandomGameSchema>;
