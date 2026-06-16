import type { GameCategory } from "@/types/database";

/**
 * Categories that describe real-life games people already own. Beerit explains
 * and assigns these games but never supplies the physical cards, dice, or board.
 */
export const PHYSICAL_GAME_CATEGORIES = new Set<GameCategory>([
  "Card Games",
  "Board Games",
  "Dice Games",
]);

export function isPhysicalCategory(category: GameCategory): boolean {
  return PHYSICAL_GAME_CATEGORIES.has(category);
}

/** Short reminder of what a group needs to bring for a physical category. */
export function physicalEquipmentLabel(category: GameCategory): string | null {
  switch (category) {
    case "Card Games":
      return "your own deck of cards";
    case "Board Games":
      return "the board and pieces";
    case "Dice Games":
      return "your own dice";
    default:
      return null;
  }
}
