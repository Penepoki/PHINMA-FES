import { useEffect, useState } from "react";

const Clock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // updates every second

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  const formattedTime = currentTime.toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="mb-3 text-lg text-gray-300 sm:text-xl md:mt-3 md:mb-8">
      Current SFF Status: <div className="text-sm text-white">{formattedTime}</div>
    </div>
  );
};

export default Clock;
