"use client";

import { useState, useEffect } from "react";

interface CountdownProps {
  targetDate: string; // ISO date string
  locale?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculate(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export function Countdown({ targetDate, locale = "mn" }: CountdownProps) {
  const target = new Date(targetDate);
  const [time, setTime] = useState<TimeLeft>(calculate(target));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTime(calculate(target)), 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate]);

  // Avoid hydration mismatch — show placeholder until mounted
  if (!mounted) return <div className="h-16" />;

  const past = target.getTime() <= Date.now();
  if (past) {
    return (
      <p className="text-[13px] tracking-wide">
        {locale === "mn" ? "Нээлттэй байна" : "Live Now"}
      </p>
    );
  }

  const labels = locale === "mn"
    ? ["өдөр", "цаг", "мин", "сек"]
    : ["days", "hrs", "min", "sec"];

  const units = [time.days, time.hours, time.minutes, time.seconds];

  return (
    <div className="flex items-end gap-4">
      {units.map((val, i) => (
        <div key={i} className="text-center">
          <p className="text-[32px] font-normal leading-none tabular-nums">
            {String(val).padStart(2, "0")}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">
            {labels[i]}
          </p>
        </div>
      ))}
    </div>
  );
}
