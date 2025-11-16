import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-10 items-start mb-20">
            <div className="w-full md:w-1/3 lg:w-2/5">
              <Skeleton className="w-full aspect-square rounded-3xl" />
            </div>
            <div className="w-full md:w-2/3 lg:w-3/5 space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-6 w-5/6" />
              <Skeleton className="h-6 w-3/4" />
              <div className="pt-4 flex gap-4">
                <Skeleton className="h-12 w-40" />
                <Skeleton className="h-12 w-40" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
