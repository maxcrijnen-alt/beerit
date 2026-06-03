export interface ActionState {
  fieldErrors?: Record<string, string[] | undefined>;
  message?: string;
  status: "error" | "idle" | "success";
}

export const INITIAL_ACTION_STATE: ActionState = {
  status: "idle",
};
