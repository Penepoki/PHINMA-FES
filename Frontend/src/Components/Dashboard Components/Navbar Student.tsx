import React, { useEffect, useState } from "react";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  HomeIcon,
  UserIcon,
} from "@heroicons/react/24/solid";

interface NavbarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isDockVisible: boolean;
  setIsDockVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const iconMap: Record<string, JSX.Element> = {
  home: <HomeIcon className="h-6 w-6 text-white" />,
  profile: <UserIcon className="h-6 w-6 text-white" />,
};

const NavbarStudent: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  isDockVisible,
  setIsDockVisible,
}) => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      if (
        tagName === "input" ||
        tagName === "textarea" ||
        target.isContentEditable
      )
        return;

      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        setIsDockVisible((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setIsDockVisible]);

  const handleClick = (key: string) => {
    setActiveView(key);
  };

  const renderAnimatedButton = (key: string, label: string) => {
    const isActive = activeView === key;
    const isHovering = hoveredButton === key;

    return (
      <button
        key={key}
        onClick={() => handleClick(key)}
        onMouseEnter={() => setHoveredButton(key)}
        onMouseLeave={() => setHoveredButton(null)}
        className={`
          relative h-8 rounded-xl flex items-center justify-center 
          transition-all duration-300
          ${isActive ? "ring-2 ring-white scale-125" : ""}
        `}
      >
        {/* Icon for desktop only, hidden if active or hovered */}
        <span
          className={`
            absolute md:block hidden
            transition-all duration-300 transform
            ${isActive || isHovering ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"}
          `}
        >
          {iconMap[key]}
        </span>

        {/* Text visible always on mobile, animated on desktop */}
        <span
          className={`
            text-white text-xs font-medium text-center px-1 transition-all transform
            ${isActive || isHovering ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
            md:absolute md:transition-all md:duration-300
            block md:inline
          `}
        >
          {label}
        </span>
      </button>
    );
  };

  return (
    <>
      {/* Toggle Button */}
      <div
        className={`fixed z-[501] -translate-y-1/2 transform transition-all duration-300 ${isDockVisible ? "right-2 bottom-10 md:bottom-10" : "right-2 bottom-0 md:bottom-0"
          }`}
      >
        <div className="tooltip tooltip-left">
          <button
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-300 bg-[#102418] text-white shadow-2xl hover:scale-110"
            onClick={() => setIsDockVisible(!isDockVisible)}
          >
            {isDockVisible ? (
              <ChevronDownIcon className="h-6 w-6" />
            ) : (
              <ChevronUpIcon className="h-6 w-6" />
            )}
          </button>
          <div className="tooltip-content hidden text-sm whitespace-pre-line sm:block">
            Open/Close Dock
            <br />
            (Shortcut: Space)
          </div>
        </div>
      </div>

      <nav data-theme="SJC" className="flex">
        {/* Primary Dock */}
        <div
          className={`dock dock-xs bottom-0 w-full transition-transform duration-300 ease-in-out ${isDockVisible ? "translate-y-0" : "translate-y-full"
            }`}
        >
          {renderAnimatedButton("home", "Home")}
          {renderAnimatedButton("profile", "Profile")}
        </div>
      </nav>
    </>
  );
};

export default NavbarStudent;

