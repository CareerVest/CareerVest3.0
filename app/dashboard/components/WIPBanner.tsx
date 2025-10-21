import { AlertTriangle, Code } from "lucide-react";

export function WIPBanner() {
  return (
    <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 rounded-lg">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="p-1.5 bg-amber-200 rounded-md">
            <Code className="h-4 w-4 text-amber-700" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-semibold text-amber-900">
              🚧 Work In Progress - Wireframe Preview
            </h3>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            This dashboard is currently in <span className="font-semibold">development phase</span> and displays{" "}
            <span className="font-semibold">dummy data</span> for visualization purposes only. All metrics, charts,
            and statistics shown here are simulated examples and do not reflect actual business data. The final
            implementation will connect to live backend APIs with real-time data.
          </p>
        </div>
      </div>
    </div>
  );
}
