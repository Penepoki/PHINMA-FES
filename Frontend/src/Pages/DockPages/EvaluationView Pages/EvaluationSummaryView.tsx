interface EvaluationSummaryProps {
  setActiveView: (view: string) => void;
}

function EvaluationSummary({ setActiveView }: EvaluationSummaryProps) {
  return (
    <div className="custom-container gap-y-6 text-white">
      <div className="breadcrumbs">
        <ul>
          <li>
            <a onClick={() => setActiveView("home")}>Home</a>
          </li>
          <li>
            <a onClick={() => setActiveView("evaluation")}>Evaluation</a>
          </li>
          <li>Create Student Evaluations</li>
        </ul>
      </div>
      <h2 className="mt-4 text-3xl font-bold text-white">Faculty Evaluation Summary</h2>
      <div className="flex h-1/3 w-full flex-col gap-2">
        <div className="flex flex-row items-start justify-start">
          <div className="absolute top-0 h-32 w-32 shrink-0 border border-white md:h-55 md:w-55">
            {" "}
            EMOJI HERE
          </div>
          <div className="flex w-full flex-col items-center justify-start gap-y-6">
            <div className="flex w-1/2 justify-center text-black">
              <input
                type="text"
                className="input w-full max-w-md border border-gray-300"
                placeholder="Search"
              />
              <div className="dropdown dropdown-end ml-2">
                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow-sm"
                >
                  <li>
                    <a href="#">Item 1</a>
                  </li>
                  <li>
                    <a href="#">Item 2</a>
                  </li>
                </ul>
              </div>
            </div>

            <span className="text-3xl font-bold text-white">Cua, Renzo Angelo S.</span>
          </div>
        </div>
      </div>
      <div className="flex h-full w-[95%] flex-col items-start justify-center rounded-lg bg-black/20"></div>
    </div>
  );
}

export default EvaluationSummary;
