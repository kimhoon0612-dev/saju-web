"use client";

import { useEffect, useState } from "react";

// Utility function to convert VAPID public key
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushProvider() {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Only run in browser that supports service workers
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
      registerServiceWorkerAndSubscribe();
    }
  }, []);

  const registerServiceWorkerAndSubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered");

      // Check current permission
      if (Notification.permission === "granted") {
        await subscribeUser(registration);
      } else if (Notification.permission !== "denied") {
        // Can optionally ask automatically or bind to a button click
        // For now we ask upon load (can be moved to a button click later for better UX)
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          await subscribeUser(registration);
        }
      }
    } catch (error) {
      console.error("Service worker registration or subscription failed", error);
    }
  };

  const subscribeUser = async (registration: ServiceWorkerRegistration) => {
    try {
      // 1. Fetch public key from backend
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://saju-web.onrender.com";
      const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:8000' : API_BASE;
      
      const keyRes = await fetch(`${baseUrl}/api/notifications/vapid-public-key`);
      if (!keyRes.ok) return;
      const { public_key } = await keyRes.json();
      
      const convertedVapidKey = urlBase64ToUint8Array(public_key);

      // 2. Subscribe via push manager
      const existingSubscription = await registration.pushManager.getSubscription();
      let subscription = existingSubscription;

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
      }

      // 3. Send subscription to our backend
      const token = localStorage.getItem("access_token") || "";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await fetch(`${baseUrl}/api/notifications/subscribe`, {
        method: "POST",
        headers,
        body: JSON.stringify(subscription),
      });

      setIsSubscribed(true);
      console.log("Push subscription complete.");

    } catch (err) {
      console.error("Failed to subscribe user", err);
    }
  };

  // This is a headless component, it doesn't render anything visible
  // unless we want to render a button to prompt permission manually.
  return null;
}
