import { Suspense } from "react";
import { ChatWorkspace } from "@/components/dashboard/chat-workspace";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <ChatWorkspace />
    </Suspense>
  );
}
