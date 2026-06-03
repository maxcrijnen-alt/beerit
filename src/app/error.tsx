"use client";

import { CircleAlert, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logDevelopmentError } from "@/lib/dev-log";
import { cn } from "@/lib/utils";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    logDevelopmentError("Route rendering failed.", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CircleAlert className="size-5 text-destructive" />
          <CardTitle>Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-5 text-muted-foreground">
            Beerit could not load this page. Try again or return to the start
            screen.
          </p>
          <Button className="w-full" onClick={reset}>
            <RotateCcw className="size-4" />
            Try again
          </Button>
          <Link
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            href="/"
          >
            Back to start
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
