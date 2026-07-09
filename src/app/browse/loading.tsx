import { Skeleton } from "@/components/ui/skeleton";

export default function BrowseLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-xl space-y-4 px-4 py-8">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-[1.5rem]" />
      {[0, 1, 2].map((index) => (
        <Skeleton className="h-64 w-full rounded-2xl" key={index} />
      ))}
    </main>
  );
}
