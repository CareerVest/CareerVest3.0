"use client";

import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Label } from "./label";

interface TimePickerProps {
  value?: string; // HH:mm format (24-hour)
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function TimePicker({
  value = "",
  onChange,
  disabled = false,
  id,
  className = "",
}: TimePickerProps) {
  // Parse 24-hour time to 12-hour format
  const parse24HourTo12Hour = (time24: string) => {
    if (!time24) return { hour: "", minute: "", period: "AM" };

    const [hours, minutes] = time24.split(":");
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const period = hour24 >= 12 ? "PM" : "AM";

    return {
      hour: hour12.toString().padStart(2, "0"),
      minute: minutes || "00",
      period,
    };
  };

  // Convert 12-hour format to 24-hour format
  const convert12HourTo24Hour = (
    hour: string,
    minute: string,
    period: string
  ) => {
    if (!hour || !minute) return "";

    let hour24 = parseInt(hour, 10);

    if (period === "AM" && hour24 === 12) {
      hour24 = 0;
    } else if (period === "PM" && hour24 !== 12) {
      hour24 += 12;
    }

    return `${hour24.toString().padStart(2, "0")}:${minute}`;
  };

  const initialTime = parse24HourTo12Hour(value);
  const [hour, setHour] = useState(initialTime.hour);
  const [minute, setMinute] = useState(initialTime.minute);
  const [period, setPeriod] = useState(initialTime.period);

  // Update local state when value prop changes
  useEffect(() => {
    const parsed = parse24HourTo12Hour(value);
    setHour(parsed.hour);
    setMinute(parsed.minute);
    setPeriod(parsed.period);
  }, [value]);

  // Notify parent when time changes
  const updateTime = (
    newHour: string,
    newMinute: string,
    newPeriod: string
  ) => {
    const time24 = convert12HourTo24Hour(newHour, newMinute, newPeriod);
    onChange(time24);
  };

  const handleHourChange = (newHour: string) => {
    setHour(newHour);
    updateTime(newHour, minute, period);
  };

  const handleMinuteChange = (newMinute: string) => {
    setMinute(newMinute);
    updateTime(hour, newMinute, period);
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    updateTime(hour, minute, newPeriod);
  };

  // Generate hours 01-12
  const hours = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );

  // Generate minutes 00-59
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  return (
    <div className={`flex gap-2 ${className}`} id={id}>
      {/* Hour */}
      <Select value={hour || undefined} onValueChange={handleHourChange} disabled={disabled}>
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="HH" />
        </SelectTrigger>
        <SelectContent className="max-h-[200px] overflow-y-auto">
          {hours.map((h) => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="flex items-center text-gray-500">:</span>

      {/* Minute */}
      <Select
        value={minute || undefined}
        onValueChange={handleMinuteChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent className="max-h-[200px] overflow-y-auto">
          {minutes.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* AM/PM */}
      <Select
        value={period}
        onValueChange={handlePeriodChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="AM" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
