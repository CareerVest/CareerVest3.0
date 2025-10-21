'use client';

import { Button } from '../../../components/ui/button';

interface ActionButtonsProps {
  onSkip: () => void;
  onView: () => void;
  onApply: () => void;
}

export function ActionButtons({ onSkip, onView, onApply }: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Skip Button */}
      <Button
        onClick={onSkip}
        className="min-w-[160px] h-14 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-2 border-red-600 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-98 rounded-xl font-semibold text-base"
      >
        <span className="flex items-center gap-2">
          <span className="text-xl">❌</span>
          <span>SKIP JOB</span>
        </span>
      </Button>

      {/* View Posting Button */}
      <Button
        onClick={onView}
        className="min-w-[160px] h-14 bg-gradient-to-r from-[#682A53] to-[#7d3463] hover:from-[#7d3463] hover:to-[#682A53] text-white border-2 border-[#682A53] shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-98 rounded-xl font-semibold text-base"
      >
        <span className="flex items-center gap-2">
          <span className="text-xl">🌐</span>
          <span>VIEW POSTING</span>
        </span>
      </Button>

      {/* Apply Button */}
      <Button
        onClick={onApply}
        className="min-w-[160px] h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-2 border-green-600 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-98 rounded-xl font-semibold text-base"
      >
        <span className="flex items-center gap-2">
          <span className="text-xl">✅</span>
          <span>APPLY NOW</span>
        </span>
      </Button>
    </div>
  );
}
