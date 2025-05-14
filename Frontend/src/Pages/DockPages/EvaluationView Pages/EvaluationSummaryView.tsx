import { FunnelIcon } from "@heroicons/react/24/solid";
interface EvaluationSummaryProps {
	setActiveView: (view: string) => void;
}

function EvaluationSummary({ setActiveView }: EvaluationSummaryProps) {
	return (
		<div className="custom-container text-white">
			<div className="breadcrumbs">
				<ul>
					<li>
						<a onClick={() => setActiveView("home")}>Home</a>
					</li>
					<li>
						<a onClick={() => setActiveView("evaluation")}>
							Evaluation
						</a>
					</li>
					<li>Evaluation Summary</li>
				</ul>
			</div>
			<div className="flex h-1/3 w-full flex-col gap-2">
				<div className="flex flex-row items-start justify-start">
					<div className="absolute h-32 w-32 shrink-0 bg-blue-500 md:h-55 md:w-55"></div>
					<div className="mt-6 flex w-full flex-col items-center justify-start gap-y-6">
						<span className="text-3xl font-bold text-white">
							Faculty Evaluation Summary
						</span>
						<div className="flex w-1/2 justify-center text-black">
							<input
								type="text"
								className="input w-full max-w-md rounded-lg border border-gray-300"
								placeholder="Search"
							/>
							<div className="dropdown dropdown-end ml-2">
								<div
									tabIndex={0}
									role="button"
									className="btn border-0 bg-[#1c402a] text-white shadow-xl"
								>
									<FunnelIcon className="h-5 w-5" />
								</div>
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

						<span className="text-3xl font-bold text-white">
							Cua, Renzo Angelo S.
						</span>
					</div>
				</div>
			</div>
			<div className="flex h-full w-[95%] flex-col items-start justify-center rounded-lg bg-black/20"></div>
		</div>
	);
}

export default EvaluationSummary;
