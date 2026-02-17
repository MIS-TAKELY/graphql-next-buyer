"use client";

import { useMutation, useQuery } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GET_USER_PROFILE_DETAILS } from "@/client/user/user.queries";
import { UPDATE_NOTIFICATION_PREFERENCES } from "@/client/user/user.mutations";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Mail, MessageSquare, Bell } from "lucide-react";

interface NotificationChannel {
  key: "emailNotifications" | "whatsappNotifications" | "inAppNotifications";
  label: string;
  description: string;
  icon: React.ReactNode;
}

const CHANNELS: NotificationChannel[] = [
  {
    key: "emailNotifications",
    label: "Email Notifications",
    description: "Receive order updates, payment confirmations, and dispute alerts via email",
    icon: <Mail className="h-5 w-5" />,
  },
  {
    key: "whatsappNotifications",
    label: "WhatsApp Notifications",
    description: "Get instant updates about your orders and deliveries on WhatsApp",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    key: "inAppNotifications",
    label: "In-App Notifications",
    description: "See real-time notifications in the app notification bell",
    icon: <Bell className="h-5 w-5" />,
  },
];

export default function NotificationsSection() {
  const { data, loading } = useQuery(GET_USER_PROFILE_DETAILS);
  const [updatePreferences, { loading: updating }] = useMutation(
    UPDATE_NOTIFICATION_PREFERENCES,
    {
      refetchQueries: [{ query: GET_USER_PROFILE_DETAILS }],
    }
  );

  const user = data?.getUserProfileDetails;

  const handleToggle = async (key: NotificationChannel["key"]) => {
    if (!user) return;
    const newValue = !user[key];
    try {
      await updatePreferences({
        variables: { input: { [key]: newValue } },
        optimisticResponse: {
          updateNotificationPreferences: {
            __typename: "User",
            id: user.id,
            emailNotifications: key === "emailNotifications" ? newValue : user.emailNotifications,
            whatsappNotifications: key === "whatsappNotifications" ? newValue : user.whatsappNotifications,
            inAppNotifications: key === "inAppNotifications" ? newValue : user.inAppNotifications,
          },
        },
      });
      toast.success(
        `${CHANNELS.find((c) => c.key === key)?.label} ${newValue ? "enabled" : "disabled"}`
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update preferences";
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-9 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how you want to receive notifications about your orders, payments, and account activity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {CHANNELS.map((channel) => {
            const isEnabled = user?.[channel.key] ?? true;
            return (
              <div
                key={channel.key}
                className="flex items-center justify-between gap-4 rounded-lg border p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-muted-foreground">{channel.icon}</div>
                  <div>
                    <p className="font-medium">{channel.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {channel.description}
                    </p>
                  </div>
                </div>
                <Button
                  variant={isEnabled ? "default" : "outline"}
                  size="sm"
                  disabled={updating}
                  onClick={() => handleToggle(channel.key)}
                >
                  {isEnabled ? "Enabled" : "Disabled"}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
