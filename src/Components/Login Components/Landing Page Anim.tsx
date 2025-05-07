import Shape_1 from "../../assets/Landing Page Assets/Shape_1.svg";
import Shape_2 from "../../assets/Landing Page Assets/Shape_2.svg";
import Shape_3 from "../../assets/Landing Page Assets/Shape_3.svg";
import Shape_4 from "../../assets/Landing Page Assets/Shape_4.svg";
import { useState, useEffect } from "react";

const BackgroundAnimation = () => {
  return (
    <div className="absolute top-0 right-0 h-screen w-screen overflow-hidden shrink-0 z-1">
      <img
        src={Shape_4}
        id="Shape_4"
        alt="Shape"
        className="fixed top-0 right-[-27px] w-[160px] h-screen opacity-80 z-40 blur-lg"
      />
      <img
        src={Shape_3}
        id="Shape_3"
        alt="Shape"
        className="absolute top-0 right-[-27px] w-auto h-screen opacity-80 z-30 blur-lg"
      />
      <img
        src={Shape_2}
        id="Shape_2"
        alt="Shape"
        className="absolute top-0 right-[-18px] w-auto h-screen opacity-80 z-20 blur-lg"
      />
      <img
        src={Shape_1}
        id="Shape_1"
        alt="Shape"
        className="absolute top-0 right-0 w-auto h-screen opacity-85 z-10 blur-lg"
      />
    </div>
  );
};

const words: string[] = ["HR", "Deans", "Program Heads", "Students"];

export function AnimatedHeading() {
  const [index, setIndex] = useState<number>(0);
  const [animatingOut, setAnimatingOut] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatingOut(true); // Trigger fadeOut animation
      setTimeout(() => {
        setIndex((prevIndex) => (prevIndex + 1) % words.length);
        setAnimatingOut(false); // After word change, reset animation
      }, 500); // Wait for fadeOut to complete before changing the word
    }, 3000); // Change every 2 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <h6 className="hidden lg:flex lg:flex-col lg:items-start lg:ml-20 text-left leading-none z-50">
      <span className="text-white text-[90px] mr-20 xl:text-[170px] font-bold">
        Welcome,
      </span>
      <br />
      <span
        className={`text-[#888888] text-[90px] font-extralight transition-all ${
          animatingOut ? "word-exit" : "word"
        }`}
      >
        {words[index]}
      </span>
    </h6>
  );
}

export default BackgroundAnimation;
