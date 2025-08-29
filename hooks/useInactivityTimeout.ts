"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/authContext";

export const useInactivity = (
  initialTimeoutMinutes: number = 30, // Time until popup (30 minutes default)
  countdownTimeoutSeconds: number = 30 // Time after popup until logout (30 seconds default)
) => {
  const { logout } = useAuth(); // Use logout from AuthContext
  const [isInactive, setIsInactive] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(countdownTimeoutSeconds);
  const appContainerRef = useRef<HTMLDivElement | null>(null); // Reference to app container
  let inactivityTimer: NodeJS.Timeout | null = null;
  let countdownTimer: NodeJS.Timeout | null = null;

  // Reset the inactivity timer
  const resetTimer = useCallback(() => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    setIsInactive(false);
    setTimeLeft(countdownTimeoutSeconds);
    if (countdownTimer) clearInterval(countdownTimer);

    inactivityTimer = setTimeout(() => {
      setIsInactive(true);
      countdownTimer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimer!);
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, initialTimeoutMinutes * 60 * 1000);
  }, [initialTimeoutMinutes, countdownTimeoutSeconds]);

  // Handle user activity events
  const handleActivity = useCallback(
    (e: Event) => {
      // Only reset if the event occurs outside the popup
      const target = e.target as HTMLElement;
      if (!target.closest(".inactivity-popup")) {
        resetTimer();
      }
    },
    [resetTimer]
  );

  const handleExtendSession = useCallback(() => {
    resetTimer();
    setIsInactive(false);
  }, [resetTimer]);

  const handleLogout = useCallback(async () => {
    setIsInactive(false);
    if (inactivityTimer) clearTimeout(inactivityTimer);
    if (countdownTimer) clearInterval(countdownTimer);
    await logout(); // Call logout from AuthContext
  }, [logout]);

  // Set up event listeners on the app container
  useEffect(() => {
    const appContainer = document.querySelector("#app-container");
    if (appContainer) {
      appContainerRef.current = appContainer as HTMLDivElement;
    }

    resetTimer();

    const container = appContainerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleActivity);
      container.addEventListener("mousedown", handleActivity);
      container.addEventListener("keypress", handleActivity);
      container.addEventListener("scroll", handleActivity);
      container.addEventListener("touchstart", handleActivity);
    }

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (countdownTimer) clearInterval(countdownTimer);
      if (container) {
        container.removeEventListener("mousemove", handleActivity);
        container.removeEventListener("mousedown", handleActivity);
        container.removeEventListener("keypress", handleActivity);
        container.removeEventListener("scroll", handleActivity);
        container.removeEventListener("touchstart", handleActivity);
      }
    };
  }, [handleActivity, resetTimer]);

  return {
    isInactive,
    timeLeft,
    handleExtendSession,
    handleLogout,
    appContainerRef,
  };
};
