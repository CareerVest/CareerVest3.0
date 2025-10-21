"use client";

import { useState, useEffect } from "react";
import { Sparkles, Rocket, TrendingUp, Award, Target, Zap, Clock, Calendar } from "lucide-react";

export function ComingSoon() {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Set a target date (e.g., 30 days from now)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      description: "Track your progress with real-time metrics and insights",
      color: "from-green-400 to-emerald-500"
    },
    {
      icon: Award,
      title: "Achievement Badges",
      description: "Unlock rewards and recognition for your accomplishments",
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set and monitor your personal and team objectives",
      color: "from-blue-400 to-cyan-500"
    },
    {
      icon: Zap,
      title: "Quick Actions",
      description: "Access your most-used features instantly",
      color: "from-yellow-400 to-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#682A53] via-[#8B6B9E] to-[#9D7FB3] flex items-center justify-center p-6">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-300/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-5xl w-full">
        {/* Main Content */}
        <div className="text-center mb-12">
          {/* Animated Logo/Icon */}
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/50 animate-bounce-slow">
                <Rocket className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-8 w-8 text-yellow-300 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 animate-fade-in">
            Your Dashboard is
            <span className="block mt-2 bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
              Coming Soon!
            </span>
          </h1>

          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-8">
            We're building something amazing just for you! Your personalized dashboard will transform how you track your progress and achieve your goals.
          </p>

          {/* Countdown Timer */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Clock className="h-6 w-6 text-yellow-300" />
              <h2 className="text-2xl font-bold text-white">Launching In</h2>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Days", value: countdown.days },
                { label: "Hours", value: countdown.hours },
                { label: "Minutes", value: countdown.minutes },
                { label: "Seconds", value: countdown.seconds }
              ].map((item, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div className="text-sm text-white/70 uppercase tracking-wide">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white text-center mb-8 flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-300" />
            What's Coming
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-white/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calendar className="h-6 w-6 text-yellow-300" />
            <h3 className="text-2xl font-bold text-white">Stay Tuned!</h3>
          </div>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            We're working hard to deliver a personalized experience tailored to your role. In the meantime, you can continue using all the existing features of the platform.
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Development in progress
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-white/60 text-sm">
            Have questions or suggestions? Contact your administrator.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        .delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
