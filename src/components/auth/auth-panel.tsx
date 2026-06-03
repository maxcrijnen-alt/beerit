"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, UserRound } from "lucide-react";
import { startTransition, useActionState, useState } from "react";
import { useForm } from "react-hook-form";
import {
  continueAsGuestAction,
  loginAction,
  signupAction,
} from "@/app/auth/actions";
import { INITIAL_ACTION_STATE, type ActionState } from "@/lib/auth/action-state";
import {
  guestSchema,
  loginSchema,
  signupSchema,
  type GuestValues,
  type LoginValues,
  type SignupValues,
} from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthMode = "login" | "signup";

function toFormData(values: Record<string, string>) {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => formData.set(key, value));

  return formData;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs text-destructive">{message}</p>;
}

function FormMessage({ state }: { state: ActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p
      className={
        state.status === "error"
          ? "rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
          : "rounded-lg bg-secondary p-3 text-sm text-secondary-foreground"
      }
    >
      {state.message}
    </p>
  );
}

function LoginForm() {
  const [state, action, pending] = useActionState(
    loginAction,
    INITIAL_ACTION_STATE,
  );
  const form = useForm<LoginValues>({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(loginSchema),
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        startTransition(() => action(toFormData(values)));
      })}
    >
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          autoComplete="email"
          id="login-email"
          placeholder="you@example.com"
          type="email"
          {...form.register("email")}
        />
        <FieldError
          message={
            form.formState.errors.email?.message ?? state.fieldErrors?.email?.[0]
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <Input
          autoComplete="current-password"
          id="login-password"
          type="password"
          {...form.register("password")}
        />
        <FieldError
          message={
            form.formState.errors.password?.message ??
            state.fieldErrors?.password?.[0]
          }
        />
      </div>
      <FormMessage state={state} />
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Signing in..." : "Sign in"}
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}

function SignupForm() {
  const [state, action, pending] = useActionState(
    signupAction,
    INITIAL_ACTION_STATE,
  );
  const form = useForm<SignupValues>({
    defaultValues: { email: "", password: "", username: "" },
    resolver: zodResolver(signupSchema),
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        startTransition(() => action(toFormData(values)));
      })}
    >
      <div className="space-y-2">
        <Label htmlFor="signup-username">Username</Label>
        <Input
          autoComplete="username"
          id="signup-username"
          placeholder="party_planner"
          {...form.register("username")}
        />
        <FieldError
          message={
            form.formState.errors.username?.message ??
            state.fieldErrors?.username?.[0]
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          autoComplete="email"
          id="signup-email"
          placeholder="you@example.com"
          type="email"
          {...form.register("email")}
        />
        <FieldError
          message={
            form.formState.errors.email?.message ?? state.fieldErrors?.email?.[0]
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          autoComplete="new-password"
          id="signup-password"
          type="password"
          {...form.register("password")}
        />
        <FieldError
          message={
            form.formState.errors.password?.message ??
            state.fieldErrors?.password?.[0]
          }
        />
      </div>
      <FormMessage state={state} />
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Creating account..." : "Create account"}
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}

function GuestForm() {
  const [state, action, pending] = useActionState(
    continueAsGuestAction,
    INITIAL_ACTION_STATE,
  );
  const form = useForm<GuestValues>({
    defaultValues: { displayName: "" },
    resolver: zodResolver(guestSchema),
  });

  return (
    <form
      className="space-y-3"
      onSubmit={form.handleSubmit((values) => {
        startTransition(() => action(toFormData(values)));
      })}
    >
      <div className="space-y-2">
        <Label htmlFor="guest-name">Guest display name</Label>
        <Input
          autoComplete="nickname"
          id="guest-name"
          placeholder="Your name in the lobby"
          {...form.register("displayName")}
        />
        <FieldError
          message={
            form.formState.errors.displayName?.message ??
            state.fieldErrors?.displayName?.[0]
          }
        />
      </div>
      <FormMessage state={state} />
      <Button className="w-full" disabled={pending} type="submit" variant="outline">
        <UserRound className="size-4" />
        {pending ? "Starting guest mode..." : "Continue as guest"}
      </Button>
    </form>
  );
}

export function AuthPanel() {
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Beerit</CardTitle>
          <CardDescription>
            Sign in to create games and earn creator Tokens.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-5 grid grid-cols-2 rounded-lg bg-secondary p-1">
            <button
              className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                mode === "login"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
              onClick={() => setMode("login")}
              type="button"
            >
              Sign in
            </button>
            <button
              className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                mode === "signup"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
              onClick={() => setMode("signup")}
              type="button"
            >
              Register
            </button>
          </div>
          {mode === "login" ? <LoginForm /> : <SignupForm />}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Play without an account</CardTitle>
          <CardDescription>
            Guests can play, like, dislike, and report games. Guest progress is
            temporary and guests cannot earn Tokens.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GuestForm />
        </CardContent>
      </Card>
    </div>
  );
}
