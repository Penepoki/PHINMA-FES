import {
  useEffect,
  useState,
} from "react";

const Clock = () => {
  const [currentTime, setCurrentTime] =
    useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // updates every second

    return () =>
      clearInterval(interval); // cleanup on unmount
  }, []);

  const formattedTime =
    currentTime.toLocaleString(
      "en-US",
      {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    );

  return (
    <p className="text-lg text-gray-300 sm:text-xl mb-3 md:mb-8 md:mt-3">
      Current SFF Status:{" "}
      <div className="text-sm text-white">
        {formattedTime}
      </div>
    </p>
  );
};

export default Clock;
