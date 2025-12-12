"use client";

import { useUser } from "@clerk/nextjs";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

export const AuthSync = () => {
    const { user, isLoaded } = useUser();
    const setUser = useAuthStore((state) => state.setUser);

    useEffect(() => {
        if (isLoaded) {
            if (user) {
                setUser({
                    id: user.id,
                    email: user.primaryEmailAddress?.emailAddress || "",
                    firstName: user.firstName || "",
                    lastName: user.lastName || "",
                    imageUrl: user.imageUrl,
                });
            } else {
                setUser(null);
            }
        }
    }, [user, isLoaded, setUser]);

    return null;
};
