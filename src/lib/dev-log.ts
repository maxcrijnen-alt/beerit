export function logDevelopmentError(context: string, error: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.error(`[Beerit] ${context}`, error);
  }
}
