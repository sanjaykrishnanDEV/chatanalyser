import * as React from "react";
import { cn } from "@/lib/utils";

const Chat = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full flex-col-reverse overflow-auto p-4",
      className
    )}
    {...props}
  />
));
Chat.displayName = "Chat";

const ChatRow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-start gap-3 my-4", className)}
    {...props}
  />
));
ChatRow.displayName = "ChatRow";

const ChatAvatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-full bg-muted p-2 w-8 h-8", className)}
    {...props}
  />
));
ChatAvatar.displayName = "ChatAvatar";

const ChatMessage = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl px-4 py-2 max-w-[85%] text-sm bg-muted",
      className
    )}
    {...props}
  />
));
ChatMessage.displayName = "ChatMessage";

export { Chat, ChatRow, ChatAvatar, ChatMessage };