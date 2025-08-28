"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function NotificationsSection() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  const toggleEmailNotifications = () => {
    setEmailNotifications(!emailNotifications);
    // Add API call to update preference if needed
  };

  const toggleSmsNotifications = () => {
    setSmsNotifications(!smsNotifications);
    // Add API call to update preference if needed
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive updates about your orders
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleEmailNotifications}
            >
              {emailNotifications ? "Disable" : "Enable"}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">SMS Notifications</p>
              <p className="text-sm text-muted-foreground">
                Get text updates about deliveries
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSmsNotifications}
            >
              {smsNotifications ? "Disable" : "Enable"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}