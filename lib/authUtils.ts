import { PublicClientApplication } from "@azure/msal-browser";

// MSAL configuration
export const msalConfig = {
  auth: {
    clientId: "3b5b4b15-81ff-4c83-a9fd-569dc8fdf282",
    authority:
      "https://login.microsoftonline.com/afd6b282-b8b0-4dbb-9985-f5c3249623f9",
    redirectUri:
      process.env.NEXT_PUBLIC_REDIRECT_URI || "http://localhost:3000",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: true,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: any, message: any, containsPii: any) => {
        if (!containsPii) {
          console.log(`[ShadCN MSAL] ${message}`);
        }
      },
      piiLoggingEnabled: false,
    },
    // Better token management - optimized for both mobile and desktop
    allowRedirectInIframe: false, // More secure, better for mobile
    iframeHashTimeout: 10000, // Increased for slower mobile connections
    loadFrameTimeout: 0,
    asyncPopups: false, // Better mobile compatibility
    windowHashTimeout: 60000, // Timeout for redirect flow
    navigateFrameWait: 500, // Wait time for iframe navigation
  },
};

export const tokenRequest = {
  scopes: ["api://careervest-backend/access_as_user"],
};

// Create and initialize MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Initialize immediately (this runs when the module is imported)
(async () => {
  try {
    await msalInstance.initialize();
    console.log("🔹 MSAL Initialized Globally");
  } catch (err) {
    console.error("🔸 Failed to Initialize MSAL Globally:", err);
  }
})();
