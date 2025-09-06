import React, { useEffect, useState } from "react";
import type { JSX } from "react";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  HomeIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
  ChartBarIcon,
  BookOpenIcon,
  BuildingLibraryIcon,
  BuildingOffice2Icon,
  RectangleStackIcon,
  CalendarDaysIcon,
  PlusCircleIcon,
  AcademicCapIcon,
  // ChartPieIcon, // <- evalSummary icon (kept commented out)
} from "@heroicons/react/24/solid";
import {UserGroupIcon} from "@heroicons/react/24/solid";

interface NavbarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isDockVisible: boolean;
  setIsDockVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

// Icons per view
const iconMap: Record<string, JSX.Element> = {
  home: <HomeIcon className="h-6 w-6 text-white" />,
  profile: <UserIcon className="h-6 w-6 text-white" />,
  evaluation: <ClipboardDocumentListIcon className="h-6 w-6 text-white" />,
  resourceGroup: <FolderIcon className="h-6 w-6 text-white" />,
  leansixsigma: <ChartBarIcon className="h-6 w-6 text-white" />,

  // ✅ Distinct Evaluation sub-icons
  createStudentEval: <PlusCircleIcon className="h-6 w-6 text-green-400" />,
  studentEval: <AcademicCapIcon className="h-6 w-6 text-yellow-400" />,
  // evalSummary: <ChartPieIcon className="h-6 w-6 text-orange-400" />,

  // ✅ Resources (secondary dock)
  programs: <BuildingLibraryIcon className="h-6 w-6 text-blue-400" />,
  subjects: <BookOpenIcon className="h-6 w-6 text-purple-400" />,
  rooms: <BuildingOffice2Icon className="h-6 w-6 text-pink-400" />,
  sections: <RectangleStackIcon className="h-6 w-6 text-red-400" />,
  schedules: <CalendarDaysIcon className="h-6 w-6 text-emerald-400" />,
    professors: <UserGroupIcon className="h-6 w-6 text-cyan-400"/>,
};

// ---- DRY child groups ----
const EVAL_CHILDREN = [
  "createStudentEval",
  "studentEval",
  // "evalSummary",
] as const;

const RESOURCE_CHILDREN_BASE = [
  "programs",
  "subjects",
  "rooms",
  "sections",
  "schedules",
  // "professors" will be conditionally included for HR users only
] as const;

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
          tagName === "input" || tagName === "textarea" || (target as HTMLElement).isContentEditable;

      if (isTyping) return;

      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        setIsDockVisible((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsDockVisible]);

  const handleClick = (page: string) => {
    setActiveView(page);
  };

  // Animated button (icon on md+, text always on mobile)
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
        className={`group relative flex h-8 w-10 items-center justify-center rounded-xl !px-1 transition-all duration-300 ${isActive ? "scale-125 ring-2 ring-white" : ""} ${!isActive ? "hover:mx-6 hover:scale-[1.4]" : ""} `}
      >
        {/* Icon (hidden on mobile) */}
        <span
            className={`absolute hidden transform transition-all duration-300 md:block ${isActive || isHovering ? "-translate-y-4 opacity-0" : "translate-y-0 opacity-100"} `}
        >
          {iconMap[key]}
        </span>

        {/* Text (always visible on mobile) */}
        <span
            className={`block translate-y-0 px-1 text-center text-xs font-medium text-white opacity-100 md:absolute md:transform md:transition-all md:duration-300 ${isActive || isHovering ? "md:translate-y-0 md:opacity-100" : "md:translate-y-4 md:opacity-0"} md:group-hover:translate-y-0 md:group-hover:opacity-100`}
        >
          {label}
        </span>
      </button>
    );
  };

  // Map all possible active views to the same child arrays (DRY)
    const isHR = typeof window !== "undefined" && localStorage.getItem("isTempFaculty") === "true";
    const RESOURCE_CHILDREN: string[] = isHR
        ? [...RESOURCE_CHILDREN_BASE, "professors"]
        : [...RESOURCE_CHILDREN_BASE];

  const secondaryDockMap: Record<string, string[]> = {
    // Evaluation cluster
    evaluation: [...EVAL_CHILDREN],
    createStudentEval: [...EVAL_CHILDREN],
    studentEval: [...EVAL_CHILDREN],
    // evalSummary: [...EVAL_CHILDREN],

    // Resources cluster
    resourceGroup: [...RESOURCE_CHILDREN],
    programs: [...RESOURCE_CHILDREN],
    subjects: [...RESOURCE_CHILDREN],
    rooms: [...RESOURCE_CHILDREN],
    sections: [...RESOURCE_CHILDREN],
    schedules: [...RESOURCE_CHILDREN],
    professors: [...RESOURCE_CHILDREN],
  };

  const secondaryDockVisible = Boolean(secondaryDockMap[activeView]);

  return (
    <>
      {/* Toggle Dock Button */}
      <div
          className={`fixed right-2 -translate-y-1/2 transform transition-all duration-300 ${
              isDockVisible && secondaryDockVisible
            ? "bottom-25 md:bottom-25"
            : isDockVisible
              ? "bottom-10"
              : "bottom-0"
          }`}
      >
        <div className="tooltip tooltip-left">
          <span className="tooltip-content rounded-xl p-2 text-sm whitespace-pre-line">
            {isDockVisible
              ? "Hide Dock\nKeyboard Shortcut (Space)"
              : "Show Dock\nKeyboard Shortcut (Space)"}
          </span>
          <button
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#102418] text-white shadow-2xl transition-transform duration-300 hover:scale-110"
            onClick={() => setIsDockVisible(!isDockVisible)}
            aria-label={isDockVisible ? "Hide dock" : "Show dock"}
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
            className={`dock dock-xs bottom-0 flex w-full items-end justify-center transition-transform duration-300 ease-in-out ${isDockVisible ? "translate-y-0" : "translate-y-[100%]"} motion-reduce:transition-none`}
        >
            {(
                [
                    ["home", "Home"],
                    ["profile", "Profile"],
                    ["evaluation", "Evaluation"],
                    ["resourceGroup", "Resources"],
                    ["leansixsigma", "Lean Six Sigma"],
                ] as const
            ).map(([key, label]) => renderAnimatedButton(key, label))}
        </div>

        {/* Secondary Dock */}
        {secondaryDockVisible && (
          <div
              className={`dock dock-xs bottom-12 z-2 flex w-full items-end justify-center gap-6 border-b border-b-[#0e4925] transition-all duration-300 ease-in-out ${isDockVisible ? "translate-y-0" : "translate-y-[200%]"} motion-reduce:transition-none`}
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
                // case "evalSummary":
                //   label = "Evaluation Summary";
                //   break;
                case "programs":
                  label = "Programs";
                  break;
                case "subjects":
                  label = "Subjects";
                  break;
                case "rooms":
                  label = "Rooms";
                  break;
                case "sections":
                  label = "Sections";
                  break;
                case "schedules":
                  label = "Schedules";
                  break;
                case "professors":
                  label = "Professors";
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
