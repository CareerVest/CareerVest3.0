"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { useAuth } from "../../contexts/authContext";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isFormAuthenticated, setIsFormAuthenticated] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    // Only redirect if Microsoft authentication is successful
    if (isInitialized && isAuthenticated) {
      console.log(
        "✅ Microsoft authentication successful, redirecting to dashboard"
      );
      router.replace("/");
    }
  }, [isAuthenticated, isInitialized, router]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isInitialized) {
      setError("Authentication is still initializing...");
      return;
    }

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Demo validation - in real app, this would validate against your backend
      if (email.includes("@") && password.length >= 6) {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // For demo: accept any valid email format with password >= 6 chars
        console.log("✅ Credentials validated successfully");

        // Show success message and set authentication state
        setError(null);
        setIsFormAuthenticated(true);
        localStorage.setItem("formAuthenticated", "true");
        localStorage.setItem("userEmail", email);
        console.log("✅ Form authentication successful, redirecting...");
        // Force redirect after a short delay to ensure state is set
        setTimeout(() => {
          router.push("/");
        }, 100);
      } else {
        setError(
          "Invalid email format or password too short (minimum 6 characters)."
        );
      }
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error("🔸 Login Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    if (!isInitialized) {
      setError("Authentication is still initializing...");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await login();
      if (!success) {
        setError("Login failed or was canceled.");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error("🔸 Login Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm text-muted-foreground">Initializing...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">
              Sign in to CareerVest
            </CardTitle>
            <CardDescription>
              Enter your credentials to validate, or use Microsoft
              authentication directly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Username/Password Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Microsoft Login Button */}
            <Button
              onClick={handleMicrosoftLogin}
              disabled={isLoading}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in with Microsoft"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
