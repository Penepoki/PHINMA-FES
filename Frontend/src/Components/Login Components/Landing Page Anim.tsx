import Shape_1 from "../../assets/Landing Page Assets/Shape_1.svg";
import Shape_2 from "../../assets/Landing Page Assets/Shape_2.svg";
import Shape_3 from "../../assets/Landing Page Assets/Shape_3.svg";
import Shape_4 from "../../assets/Landing Page Assets/Shape_4.svg";
import { useState, useEffect } from "react";

const BackgroundAnimation = () => {
  return (
    <div className="absolute top-0 right-0 z-1 h-screen w-screen shrink-0 overflow-hidden">
      <img
        src={Shape_4}
        id="Shape_4"
        alt="Shape"
        className="fixed top-0 right-[-27px] z-40 h-screen w-[160px] opacity-80 blur-lg"
      />
      <img
        src={Shape_3}
        id="Shape_3"
        alt="Shape"
        className="absolute top-0 right-[-27px] z-30 h-screen w-auto opacity-80 blur-lg"
      />
      <img
        src={Shape_2}
        id="Shape_2"
        alt="Shape"
        className="absolute top-0 right-[-18px] z-20 h-screen w-auto opacity-80 blur-lg"
      />
      <img
        src={Shape_1}
        id="Shape_1"
        alt="Shape"
        className="absolute top-0 right-0 z-10 h-screen w-auto opacity-85 blur-lg"
      />
    </div>
  );
};

const words: string[] = ["HR", "Deans", "Program Heads", "Professors", "Students"];

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
    }, 4000); // Change every 2 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <h6 className="z-50 hidden text-left leading-none lg:ml-20 lg:flex lg:flex-col lg:items-start">
      <span className="mr-20 text-[90px] font-bold text-white xl:text-[170px]">Welcome,</span>
      <br />
      <span
        className={`text-[90px] font-extralight text-[#C4C4C4] transition-all duration-[9000ms] ease-in-out ${
          animatingOut ? "word-exit" : "word"
        }`}
      >
        {words[index]}
      </span>

      <span className="mt-24 hidden max-h-80 w-[60%] overflow-y-auto text-[18px] leading-loose font-extralight text-[#888888] lg:block">
        To a smarter, more streamlined way to evaluate teaching. Our platform combines the Student
        Feedback Framework (SFF) and the COPUS classroom observation model, enhanced by AI-driven
        sentiment analysis and NLP insights all while leveraging principles from the Lean Six Sigma
        approach, we focus on continuous improvement by turning evaluation data into actionable
        insights for both academic and business fronts. With structured feedback and transparent
        processes, evaluations become more meaningful, fair, and effective for faculty, students and
        management alike.
      </span>
    </h6>
  );
}

export default BackgroundAnimation;
