"use client";

import { useEffect, useState } from "react";
import { Quote, Sparkles } from "lucide-react";
import { getDailyQuote } from "../utils/leaderboardData";

export function MotivationalQuote() {
  const [quote, setQuote] = useState({ text: "", author: "" });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setQuote(getDailyQuote());
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl p-6
        bg-gradient-to-br from-[#682A53] via-[#7d3463] to-[#8f3f72]
        text-white shadow-xl
        transition-all duration-700 transform
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />

      {/* Sparkle animation */}
      <Sparkles className="absolute top-4 right-4 h-5 w-5 text-yellow-300 animate-pulse" />

      <div className="relative z-10">
        <div className="flex items-start gap-3 mb-4">
          <Quote className="h-8 w-8 text-yellow-300 flex-shrink-0 mt-1" />
          <div>
            <p className="text-lg font-medium leading-relaxed italic">
              "{quote.text}"
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <p className="text-sm text-white/80 font-medium">
            — {quote.author}
          </p>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400" />
    </div>
  );
}
