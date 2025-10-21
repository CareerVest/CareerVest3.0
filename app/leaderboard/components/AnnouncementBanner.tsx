"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Trophy, Target, PartyPopper, Rocket } from "lucide-react";
import { getCompanyAnnouncements, CompanyAnnouncement } from "../utils/leaderboardData";
import { ConfettiAnimation } from "./ConfettiAnimation";

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<CompanyAnnouncement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const activeAnnouncements = getCompanyAnnouncements().filter(a => a.isActive);
    setAnnouncements(activeAnnouncements);

    // Show confetti for winner announcements
    if (activeAnnouncements.length > 0 && activeAnnouncements[0].type === "Winner") {
      setShowConfetti(true);
    }
  }, []);

  useEffect(() => {
    if (announcements.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 8000); // Auto-rotate every 8 seconds

    return () => clearInterval(timer);
  }, [announcements.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  if (!isVisible || announcements.length === 0) return null;

  const currentAnnouncement = announcements[currentIndex];

  const getAnnouncementIcon = () => {
    switch (currentAnnouncement.type) {
      case "Winner":
        return <Trophy className="h-6 w-6" />;
      case "Milestone":
        return <Target className="h-6 w-6" />;
      case "Challenge":
        return <Rocket className="h-6 w-6" />;
      case "Celebration":
        return <PartyPopper className="h-6 w-6" />;
      default:
        return <Trophy className="h-6 w-6" />;
    }
  };

  const getBannerColor = () => {
    switch (currentAnnouncement.type) {
      case "Winner":
        return "from-yellow-400 via-orange-400 to-orange-500";
      case "Milestone":
        return "from-purple-500 via-pink-500 to-pink-600";
      case "Challenge":
        return "from-blue-500 via-cyan-500 to-teal-500";
      case "Celebration":
        return "from-green-400 via-emerald-400 to-teal-500";
      default:
        return "from-[#682A53] via-[#7d3463] to-[#8f3f72]";
    }
  };

  return (
    <>
      <ConfettiAnimation trigger={showConfetti} duration={4000} onComplete={() => setShowConfetti(false)} />

      <div className={`
        relative overflow-hidden rounded-xl mb-4
        bg-gradient-to-r ${getBannerColor()}
        text-white shadow-lg
        animate-fadeIn
      `}>
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            animation: 'slide 20s linear infinite'
          }} />
        </div>

        <div className="relative z-10 p-4">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                {getAnnouncementIcon()}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold">
                  {currentAnnouncement.title}
                </h3>
                {currentAnnouncement.type === "Winner" && (
                  <span className="text-2xl animate-bounce">{currentAnnouncement.icon}</span>
                )}
              </div>
              <p className="text-white/90 text-sm leading-relaxed">
                {currentAnnouncement.message}
              </p>
              {currentAnnouncement.employeeName && (
                <div className="mt-2 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-xs font-semibold">{currentAnnouncement.employeeName}</span>
                  <span className="text-xs text-white/70">•</span>
                  <span className="text-xs text-white/70">{currentAnnouncement.employeeRole}</span>
                </div>
              )}
            </div>

            {/* Navigation Controls */}
            {announcements.length > 1 && (
              <div className="flex-shrink-0 flex items-center gap-2">
                <button
                  onClick={handlePrevious}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors"
                  aria-label="Previous announcement"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm font-medium px-2">
                  {currentIndex + 1} / {announcements.length}
                </span>
                <button
                  onClick={handleNext}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors"
                  aria-label="Next announcement"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={() => setIsVisible(false)}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors"
              aria-label="Close announcement"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress dots */}
          {announcements.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-3">
              {announcements.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`
                    h-1.5 rounded-full transition-all duration-300
                    ${idx === currentIndex ? 'w-8 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}
                  `}
                  aria-label={`Go to announcement ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30" />
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(60px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </>
  );
}
