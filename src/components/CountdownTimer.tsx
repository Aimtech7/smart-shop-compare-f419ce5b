import { useState, useEffect } from 'react';

interface Props {
  targetDate?: Date;
}

export function CountdownTimer({ targetDate }: Props) {
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = targetDate || new Date(Date.now() + 8 * 60 * 60 * 1000); // Default 8h from now
    const interval = setInterval(() => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { clearInterval(interval); return; }
      setTime({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-1">
      {[
        { label: 'HRS', value: pad(time.hours) },
        { label: 'MIN', value: pad(time.minutes) },
        { label: 'SEC', value: pad(time.seconds) },
      ].map(({ label, value }, i) => (
        <div key={label} className="flex items-center gap-1">
          {i > 0 && <span className="text-primary font-bold">:</span>}
          <div className="bg-foreground text-background rounded px-2 py-1 min-w-[36px] text-center">
            <p className="font-display font-bold text-sm leading-none">{value}</p>
            <p className="text-[7px] uppercase tracking-wider opacity-60 mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
