import { useEffect, useState } from "react";

// mm:ss
export const clock = (total) =>
  `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;

/*
  Live "mm:ss" countdown. The server sends the seconds left, so a wrong clock on the phone cannot change it.
  Calls onDone once when it reaches 0 (the screen then asks the server for the new state).
  warnBelow = number of seconds under which the time turns red.
*/
export default function PaymentCountdown({ seconds, onDone, warnBelow = 120 }) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    const deadline = Date.now() + seconds * 1000;
    setLeft(seconds);
    if (seconds <= 0) return undefined;

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0) {
        clearInterval(timer);
        onDone?.();
      }
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  return <span className={left <= warnBelow ? "font-bold text-red-600" : "font-bold"}>{clock(left)}</span>;
}
