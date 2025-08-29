"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useAuth } from "../contexts/authContext";
import { Loader2, LogOut, User } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isInitialized, user, logout } = useAuth();
  const router = useRouter();
  const [isFormAuthenticated, setIsFormAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated via form login (stored in localStorage)
    const formAuth = localStorage.getItem("formAuthenticated");
    console.log("🔍 Main page - Checking form authentication:", formAuth);
    if (formAuth === "true") {
      setIsFormAuthenticated(true);
      console.log("✅ Main page - Form authentication set to true");
    }
  }, []);

  // Handle auth state changes
  useEffect(() => {
    console.log("🔍 Main page - Auth state check:", {
      isInitialized,
      isAuthenticated,
      isFormAuthenticated,
    });

    // Check localStorage directly in the auth check
    const formAuth = localStorage.getItem("formAuthenticated");
    const isFormAuth = formAuth === "true";

    if (
      isInitialized &&
      !isAuthenticated &&
      !isFormAuthenticated &&
      !isFormAuth
    ) {
      console.log("❌ Main page - Not authenticated, redirecting to login");
      router.replace("/login");
    } else if (
      isInitialized &&
      (isAuthenticated || isFormAuthenticated || isFormAuth)
    ) {
      console.log("✅ Main page - Authenticated, redirecting to dashboard");
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isFormAuthenticated, isInitialized, router]);

  const handleLogout = async () => {
    // Clear form authentication
    localStorage.removeItem("formAuthenticated");
    setIsFormAuthenticated(false);

    // If using Microsoft auth, also logout from there
    if (isAuthenticated) {
      await logout();
    } else {
      // Redirect to login if only form authenticated
      router.push("/login");
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  // Check both authentication methods
  const formAuth = localStorage.getItem("formAuthenticated");
  const isFormAuth = formAuth === "true";

  if (!isAuthenticated && !isFormAuthenticated && !isFormAuth) {
    return null; // Will redirect to login
  }
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        {/* Header with user info and logout */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary">
              Welcome to CareerVest
            </h1>
            <p className="text-xl text-muted-foreground">
              A beautiful Next.js project with shadcn/ui components
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {user?.name ||
                    user?.username ||
                    localStorage.getItem("userEmail") ||
                    "User"}
                </span>
              </div>
            </Card>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>
                Different button styles available in shadcn/ui
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button>Default Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Button Sizes</CardTitle>
              <CardDescription>
                Various button sizes for different use cases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interactive Demo</CardTitle>
              <CardDescription>
                Click the button to see it in action
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => alert("Button clicked!")}
                className="w-full"
              >
                Click Me!
              </Button>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                This demonstrates the full shadcn/ui setup
              </p>
            </CardFooter>
          </Card>
        </div>
        <div className="mt-12 text-center">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Your shadcn/ui project is ready to use!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This project includes:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Next.js 14 with App Router</li>
                <li>• TypeScript configuration</li>
                <li>• Tailwind CSS with shadcn/ui theme</li>
                <li>• Button and Card components</li>
                <li>• Responsive design</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
