import React, { useEffect, useState } from "react";

export function AnimatedPrice({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (value === displayValue) return;

    const duration = 250; // ms
    const frames = 15;
    const stepTime = duration / frames;
    const start = displayValue;
    const end = value;

    let current = start;
    const increment = (end - start) / frames;
    
    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      current += increment;
      if (frame >= frames) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, displayValue]);

  return <>{displayValue.toLocaleString("en-IN")}</>;
}
