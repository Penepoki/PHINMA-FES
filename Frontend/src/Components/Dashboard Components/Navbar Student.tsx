import React, {
  useEffect,
  useState,
} from "react";

interface NavbarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const NavbarStudent: React.FC<
  NavbarProps
> = ({ activeView, setActiveView }) => {
  const [
    isDockVisible,
    setIsDockVisible,
  ] = useState<boolean>(true);

  useEffect(() => {
    const handleKeyDown = (
      e: KeyboardEvent
    ) => {
      const target =
        e.target as HTMLElement;
      const tagName =
        target.tagName.toLowerCase();

      const isTyping =
        tagName === "input" ||
        tagName === "textarea" ||
        target.isContentEditable;

      if (isTyping) return;

      if (
        e.code === "Space" ||
        e.key === " "
      ) {
        e.preventDefault();
        setIsDockVisible(
          (prev) => !prev
        );
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );
    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  const handleClick = (
    page: string
  ) => {
    setActiveView(page);
  };

  const buttonClasses = (btn: string) =>
    `dock ${activeView === btn ? "dock-active" : ""}`;

  return (
    <>
      {/* Toggle Button - Now Outside Navbar */}
      <div
        className={`fixed z-[501] transition-all duration-300 transform -translate-y-1/2
    ${isDockVisible ? "left-4" : "left-2"}
    ${
      isDockVisible
        ? "bottom-38 md:bottom-20"
        : isDockVisible
          ? "bottom-20"
          : "bottom-0"
    }
  `}
      >
        <div className="tooltip tooltip-right">
          <button
            className="px-4 bg-primary text-white text-xl border-1 border-gray-300 rounded-xl shadow-2xl h-12 hover:scale-110"
            onClick={() =>
              setIsDockVisible(
                !isDockVisible
              )
            }
          >
            {isDockVisible
              ? "◀"
              : "▶"}
          </button>
          <div className="tooltip-content text-sm whitespace-pre-line hidden sm:block">
            Open/Close Dock
            <br />
            (Shortcut: Space)
          </div>
        </div>
      </div>

      <nav
        data-theme="SJC"
        className="relative"
      >
        {/* Primary Dock */}
        <div
          className={`dock dock-xl w-[95%] mx-auto bottom-2 rounded-xl shadow-2xl transition-transform duration-300 ease-in-out z-[500] border-1 border-[#1c402a] ${
            isDockVisible
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >
          <button
            className={buttonClasses(
              "home"
            )}
            onClick={() =>
              handleClick("home")
            }
          >
            <span className="dock-label">
              Home
            </span>
          </button>

          <button
            className={buttonClasses(
              "profile"
            )}
            onClick={() =>
              handleClick("profile")
            }
          >
            <span className="dock-label">
              Profile
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default NavbarStudent;
