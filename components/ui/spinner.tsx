import React from "react";
import { cn } from "../../lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "pulse" | "dots" | "bars" | "ripple";
  className?: string;
  overlay?: boolean;
  text?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  variant = "default",
  className,
  overlay = false,
  text,
}) => {
  const renderSpinner = () => {
    switch (variant) {
      case "pulse":
        return (
          <div
            className={cn(
              "animate-pulse rounded-full bg-gradient-to-r from-[#682A53] to-[#8B5CF6]",
              sizeClasses[size],
              className
            )}
          />
        );

      case "dots":
        return (
          <div className={cn("flex space-x-1", className)}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "bg-[#682A53] rounded-full animate-bounce",
                  size === "sm" && "w-1 h-1",
                  size === "md" && "w-1.5 h-1.5",
                  size === "lg" && "w-2 h-2",
                  size === "xl" && "w-3 h-3"
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: "0.6s",
                }}
              />
            ))}
          </div>
        );

      case "bars":
        return (
          <div className={cn("flex space-x-1", className)}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "bg-[#682A53] rounded-sm animate-pulse",
                  size === "sm" && "w-1 h-3",
                  size === "md" && "w-1.5 h-4",
                  size === "lg" && "w-2 h-6",
                  size === "xl" && "w-3 h-8"
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: "0.8s",
                }}
              />
            ))}
          </div>
        );

      case "ripple":
        return (
          <div className={cn("relative", sizeClasses[size], className)}>
            <div className="absolute inset-0 border-2 border-[#682A53] rounded-full animate-ping opacity-75" />
            <div
              className="absolute inset-0 border-2 border-[#8B5CF6] rounded-full animate-ping opacity-50"
              style={{ animationDelay: "0.2s" }}
            />
            <div className="absolute inset-2 bg-[#682A53] rounded-full animate-pulse" />
          </div>
        );

      default:
        return (
          <div
            className={cn(
              "animate-spin rounded-full border-2 border-gray-200 border-t-[#682A53]",
              sizeClasses[size],
              className
            )}
          />
        );
    }
  };

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center space-y-4">
          {renderSpinner()}
          {text && <p className="text-sm text-gray-600 font-medium">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      {renderSpinner()}
      {text && <p className="text-sm text-gray-600 font-medium">{text}</p>}
    </div>
  );
};

export default Spinner;
