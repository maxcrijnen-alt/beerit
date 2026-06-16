import { Compass } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <Compass className="size-5 text-primary" />
          <CardTitle>Page not found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-5 text-muted-foreground">
            That Beerit page does not exist. Head back home or browse games to
            start an evening.
          </p>
          <Link className={cn(buttonVariants(), "w-full")} href="/home">
            Back to home
          </Link>
          <Link
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            href="/browse"
          >
            Browse games
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
