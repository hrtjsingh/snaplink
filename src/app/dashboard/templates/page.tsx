'use client';
import { useEffect, useState } from "react";

export default function ComingSoon() {
  const launchDate = new Date("2026-11-01T00:00:00");

  const calculateTimeLeft = () => {
    const difference = launchDate - new Date();
    if (difference <= 0) return null;

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [email, setEmail] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex mt-28 items-center justify-center bg-transparent animate-fade-in-up">
      <div className="max-w-xl text-center text-white snap-card p-10">
        <h1 className="mb-3 text-4xl font-bold md:text-5xl snap-gradient-text-static">
          🚀 Coming Soon
        </h1>

        <p className="mb-8 text-lg opacity-90">
          We’re building something amazing. Stay tuned!
        </p>

        {timeLeft ? (
          <div className="mb-10 flex justify-center gap-4">
            {Object.entries(timeLeft).map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md animate-scale-in"
              >
                <div className="text-3xl font-semibold">
                  {String(value).padStart(2, "0")}
                </div>
                <div className="text-xs uppercase tracking-wide opacity-80">
                  {label}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mb-8 text-xl font-semibold">
            🎉 We are live!
          </p>
        )}

   
        <p className="mt-6 text-sm opacity-70">
          © {new Date().getFullYear()} Snaplink. All rights reserved.
        </p>
      </div>
    </div>
  );
}
