"use client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, X } from "lucide-react"

interface Notification {
  id: string
  type: "success" | "error" | "info"
  message: string
  duration?: number
}

interface RequestNotificationsProps {
  notifications: Notification[]
  onClose: (id: string) => void
}

export default function RequestNotifications({ notifications, onClose }: RequestNotificationsProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <Alert
          key={notification.id}
          className={
            notification.type === "success"
              ? "border-green-500/50 bg-green-500/10"
              : notification.type === "error"
                ? "border-red-500/50 bg-red-500/10"
                : "border-blue-500/50 bg-blue-500/10"
          }
        >
          <div className="flex items-start gap-3">
            {notification.type === "success" && (
              <CheckCircle2 className="h-5 w-5 text-green-500 flex shrink-0 mt-0.5" />
            )}
            {notification.type === "error" && <AlertCircle className="h-5 w-5 text-red-500 flex shrink-0 mt-0.5" />}
            {notification.type === "info" && <AlertCircle className="h-5 w-5 text-blue-500 flex shrink-0 mt-0.5" />}
            <AlertDescription
              className={
                notification.type === "success"
                  ? "text-green-400"
                  : notification.type === "error"
                    ? "text-red-400"
                    : "text-blue-400"
              }
            >
              {notification.message}
            </AlertDescription>
            <button onClick={() => onClose(notification.id)} className="flex shrink-0 ml-auto">
              <X className="h-4 w-4" />
            </button>
          </div>
        </Alert>
      ))}
    </div>
  )
}
