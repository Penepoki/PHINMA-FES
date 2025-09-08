import React, { useEffect, useState } from "react";
import type { JSX } from "react";
import { ChevronUpIcon, ChevronDownIcon, HomeIcon, UserIcon } from "@heroicons/react/24/solid";

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
      if (tagName === "input" || tagName === "textarea" || target.isContentEditable) return;

      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        setIsDockVisible((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsDockVisible]);

  const handleClick = (key: string) => setActiveView(key);

  // ✅ Match NavbarHR behavior: text always visible on mobile; animations only on md+
  const renderAnimatedButton = (key: string, label: string) => {
    const isActive = activeView === key;
    const isHovering = hoveredButton === key;

    return (
      <button
        key={key}
        aria-label={label}
        onClick={() => handleClick(key)}
        onMouseEnter={() => setHoveredButton(key)}
        onMouseLeave={() => setHoveredButton(null)}
        className={`group relative flex h-8 w-10 items-center justify-center rounded-xl !px-1 transition-all duration-300
          ${isActive ? "scale-125 ring-2 ring-white" : "hover:mx-6 hover:scale-[1.4]"}`}
      >
        {/* Icon (hidden on mobile; animates only on md+) */}
        <span
          className={`absolute hidden md:block transform transition-all duration-300
            ${isActive || isHovering ? "md:-translate-y-4 md:opacity-0" : "md:translate-y-0 md:opacity-100"}`}
        >
          {iconMap[key]}
        </span>

        {/* Label: always visible on mobile; md+ animates like NavbarHR */}
        <span
          className={`block px-1 text-center text-xs font-medium text-white
            translate-y-0 opacity-100
            md:absolute md:transform md:transition-all md:duration-300
            ${isActive || isHovering ? "md:translate-y-0 md:opacity-100" : "md:translate-y-4 md:opacity-0"}
            md:group-hover:translate-y-0 md:group-hover:opacity-100`}
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
        className={`fixed z-[501] -translate-y-1/2 transform transition-all duration-300
          ${isDockVisible ? "right-2 bottom-10 md:bottom-10" : "right-2 bottom-0 md:bottom-0"}`}
      >
        <div className="tooltip tooltip-left">
          <button
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-300 bg-[#102418] text-white shadow-2xl hover:scale-110"
            onClick={() => setIsDockVisible(!isDockVisible)}
            aria-label={isDockVisible ? "Hide dock" : "Show dock"}
          >
            {isDockVisible ? <ChevronDownIcon className="h-6 w-6" /> : <ChevronUpIcon className="h-6 w-6" />}
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
          className={`dock dock-xs bottom-0 w-full transition-transform duration-300 ease-in-out
            ${isDockVisible ? "translate-y-0" : "translate-y-full"}`}
        >
          {renderAnimatedButton("home", "Home")}
          {renderAnimatedButton("profile", "Profile")}
        </div>
      </nav>
    </>
  );
};

export default NavbarStudent;
