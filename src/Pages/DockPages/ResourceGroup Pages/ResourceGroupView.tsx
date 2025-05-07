interface ResourceGroupProps {
  setActiveView: (view: string) => void;
}

function ResourceGroup({
  setActiveView,
}: ResourceGroupProps) {
  return (
    <div className="custom-container">
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <ul>
          <li>
            <a
              onClick={() =>
                setActiveView("home")
              }
            >
              Home
            </a>
          </li>
          <li>Resource Group</li>
        </ul>
      </div>
      <div className="flex flex-col md:flex-row justify-center items-center w-full h-full z-10 gap-6 p-0 md:p-6">
        <div className="rg-container md:p-6 md:gap-y-6">
          <h2 className="text-4xl font-bold mb-4">
            Courses
          </h2>
          <span className="text-xl text-gray-300">
            Number of current courses:
          </span>
          <span className="text-8xl">
            0
          </span>
        </div>
        <div className="rg-container md:p-6 md:gap-y-6">
          <h2 className="text-4xl font-bold mb-4">
            Subjects
          </h2>
          <span className="text-xl text-gray-300">
            Number of current subjects:
          </span>
          <span className="text-8xl">
            0
          </span>
        </div>
        <div className="rg-container md:p-6 md:gap-y-6">
          <h2 className="text-4xl font-bold mb-4">
            Rooms
          </h2>
          <span className="text-xl text-gray-300">
            Number of current rooms:
          </span>
          <span className="text-8xl">
            0
          </span>
        </div>
        <div className="rg-container md:p-6 md:gap-y-6">
          <h2 className="text-4xl font-bold mb-4">
            Schedules
          </h2>
          <span className="text-xl text-gray-300">
            Number of current schedules:
          </span>
          <span className="text-8xl">
            0
          </span>
        </div>
      </div>
    </div>
  );
}

export default ResourceGroup;
