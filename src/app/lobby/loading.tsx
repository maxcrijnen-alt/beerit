import { Skeleton } from "@/components/ui/skeleton";

export default function LobbyLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-xl space-y-4 px-4 py-8">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-44 w-full rounded-2xl" />
      <Skeleton className="h-5 w-48" />
      {[0, 1].map((index) => (
        <Skeleton className="h-20 w-full rounded-2xl" key={index} />
      ))}
    </main>
  );
}
