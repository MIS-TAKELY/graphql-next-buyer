"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SignOutButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function SettingsSection() {
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("usd");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    // Add API call to update language preference
  };

  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
    // Add API call to update currency preference
  };

  const handleThemeChange = (value: string) => {
    setTheme(value);
    // Add API call to persist theme preference if needed
  };

  const handleDeleteAccount = () => {
    // Add account deletion logic (e.g., API call)
    // Possibly show a confirmation modal
  };

  // Ensure component is mounted before rendering theme-related UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent hydration mismatch

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Language & Region</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Language
                </label>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Currency
                </label>
                <Select value={currency} onValueChange={handleCurrencyChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">NRP</SelectItem>
                    <SelectItem value="eur">INR</SelectItem>
                    <SelectItem value="gbp">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Appearance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Theme</label>
                <Select
                  value={theme || "light"}
                  onValueChange={handleThemeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="font-medium mb-2 text-red-600">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Permanently delete your account and all associated data
            </p>
            <Button className="bg-red-600" onClick={handleDeleteAccount}>
              <SignOutButton>Delete Account</SignOutButton>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
