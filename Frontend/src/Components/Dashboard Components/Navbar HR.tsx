import React, { useEffect, useState } from "react";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  HomeIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
  ChartBarIcon,
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
  evaluation: <ClipboardDocumentListIcon className="h-6 w-6 text-white" />,
  resourceGroup: <FolderIcon className="h-6 w-6 text-white" />,
  leansixsigma: <ChartBarIcon className="h-6 w-6 text-white" />,
  createStudentEval: <ClipboardDocumentListIcon className="h-6 w-6 text-green-400" />,
  studentEval: <ClipboardDocumentListIcon className="h-6 w-6 text-yellow-400" />,
  evalSummary: <ClipboardDocumentListIcon className="h-6 w-6 text-orange-400" />,
  programs: <FolderIcon className="h-6 w-6 text-blue-400" />,
  subjects: <FolderIcon className="h-6 w-6 text-purple-400" />,
  rooms: <FolderIcon className="h-6 w-6 text-pink-400" />,
  schedules: <FolderIcon className="h-6 w-6 text-emerald-400" />,
  sections: <FolderIcon className="h-6 w-6 text-red-400" />,
};

const NavbarHR: React.FC<NavbarProps> = ({
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
      const isTyping =
        tagName === "input" ||
        tagName === "textarea" ||
        target.isContentEditable;

      if (isTyping) return;

      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        setIsDockVisible((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleClick = (page: string) => {
    setActiveView(page);
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
        relative h-8 w-10 !px-1 rounded-xl flex items-center justify-center 
        transition-all duration-300
        ${isActive ? "ring-2 ring-white scale-125" : ""}
        ${!isActive && "hover:scale-[1.4] hover:mx-2"}
        md:transition-all
      `}
      >
        {/* Icon for desktop only */}
        <span
          className={`
          absolute md:block hidden
          transition-all duration-300 transform
          ${isActive || isHovering ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"}
        `}
        >
          {iconMap[key]}
        </span>

        {/* Always show text on mobile, animate on desktop */}
        <span
          className={`
          text-white text-xs font-medium text-center px-1 transition-all transform
          ${isActive || isHovering ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          md:absolute md:transition-all md:duration-300
          md:group-hover:opacity-100 md:group-hover:translate-y-0
          block md:inline
        `}
        >
          {label}
        </span>
      </button>
    );
  };

  const secondaryDockMap: Record<string, string[]> = {
    evaluation: ["createStudentEval", "studentEval", "evalSummary"],
    createStudentEval: ["createStudentEval", "studentEval", "evalSummary"],
    studentEval: ["createStudentEval", "studentEval", "evalSummary"],
    evalSummary: ["createStudentEval", "studentEval", "evalSummary"],
    resourceGroup: ["programs", "subjects", "rooms", "schedules", "sections"],
    programs: ["programs", "subjects", "rooms", "schedules", "sections"],
    subjects: ["programs", "subjects", "rooms", "schedules", "sections"],
    rooms: ["programs", "subjects", "rooms", "schedules", "sections"],
    schedules: ["programs", "subjects", "rooms", "schedules", "sections"],
    sections: ["programs", "subjects", "rooms", "schedules", "sections"],
  };

  const secondaryDockVisible = Boolean(secondaryDockMap[activeView]);

  return (
    <>
      {/* Toggle Dock Button */}
      <div
        className={`fixed -translate-y-1/2 transform transition-all duration-300 ${isDockVisible ? "right-2" : "right-2"
          } ${isDockVisible && secondaryDockVisible
            ? "bottom-25 md:bottom-25"
            : isDockVisible
              ? "bottom-10"
              : "bottom-0"
          }`}
      >
        <div className="tooltip tooltip-left">
          <button
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-400 bg-[#102418] text-white shadow-2xl hover:scale-110 transition-transform duration-300"
            onClick={() => setIsDockVisible(!isDockVisible)}
          >
            {isDockVisible ? (
              <ChevronDownIcon className="h-6 w-6" />
            ) : (
              <ChevronUpIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      <nav data-theme="SJC" className="flex flex-col items-center">
        {/* Primary Dock */}
        <div
          className={`dock dock-xs bottom-0 w-full flex justify-center items-end transition-transform duration-300 ease-in-out ${isDockVisible ? "translate-y-0" : "translate-y-[100%]"
            }`}
        >
          {[
            ["home", "Home"],
            ["profile", "Profile"],
            ["evaluation", "Evaluation"],
            ["resourceGroup", "Resources"],
            ["leansixsigma", "Lean Six Sigma"],
          ].map(([key, label]) => renderAnimatedButton(key, label))}
        </div>

        {/* Secondary Dock */}
        {secondaryDockVisible && (
          <div
            className={`dock dock-xs bottom-12 z-2 w-full flex justify-center items-end gap-6 border-b border-b-[#0e4925] transition-all duration-300 ease-in-out ${isDockVisible ? "translate-y-0" : "translate-y-[200%]"
              }`}
          >
            {secondaryDockMap[activeView]?.map((view) => {
              let label = view;
              switch (view) {
                case "createStudentEval":
                  label = "Create Evaluations";
                  break;
                case "studentEval":
                  label = "Student Evaluations";
                  break;
                case "evalSummary":
                  label = "Evaluation Summary";
                  break;
                case "programs":
                  label = "Programs";
                  break;
                case "subjects":
                  label = "Subjects";
                  break;
                case "rooms":
                  label = "Rooms";
                  break;
                case "schedules":
                  label = "Schedules";
                  break;
                case "sections":
                  label = "Sections";
                  break;
              }

              return renderAnimatedButton(view, label);
            })}
          </div>
        )}
      </nav>
    </>
  );
};

export default NavbarHR;

