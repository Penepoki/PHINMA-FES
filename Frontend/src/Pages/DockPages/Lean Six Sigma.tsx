import greenBarGraph from "../../assets/green-bar-graph.jpg";

interface ResourceGroupProps {
	setActiveView: (view: string) => void;
}

function LeanSixSigma({ setActiveView }: ResourceGroupProps) {
	return (
		<div className="custom-container">
			{/* Breadcrumbs */}
			<div className="breadcrumbs">
				<ul>
					<li>
						<a onClick={() => setActiveView("home")}>Home</a>
					</li>
					<li>Resource Group</li>
				</ul>
			</div>
			<div className="mt-20 flex h-full w-full flex-col gap-6 px-6">
				<div className="flex h-full w-full flex-col rounded-lg shadow-2xl">
					<div className="stats h-1/2 w-full rounded-[0px] border-b border-b-gray-600 text-lg text-white backdrop-blur-lg">
						<div className="stat">
							<div className="stat-figure text-secondary">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									className="inline-block h-8 w-8 stroke-current text-white"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									></path>
								</svg>
							</div>
							<div className="stat-title text-white">
								Interactions
							</div>
							<div className="stat-value">7</div>
							<div className="stat-desc text-white">
								Jan 1st - Feb 1st
							</div>
						</div>

						<div className="stat">
							<div className="stat-figure text-secondary">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									className="inline-block h-8 w-8 stroke-current text-white"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
									></path>
								</svg>
							</div>
							<div className="stat-title text-white">
								New Users
							</div>
							<div className="stat-value">4,200</div>
							<div className="stat-desc text-white">
								↗︎ 400 (22%)
							</div>
						</div>

						<div className="stat">
							<div className="stat-figure text-secondary">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									className="inline-block h-8 w-8 stroke-current text-white"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
									></path>
								</svg>
							</div>
							<div className="stat-title text-white">
								New Registers
							</div>
							<div className="stat-value">1,200</div>
							<div className="stat-desc text-white">
								↘︎ 90 (14%)
							</div>
						</div>

						<div className="stat">
							<div className="stat-figure text-secondary">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									className="inline-block h-8 w-8 stroke-current text-white"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
									></path>
								</svg>
							</div>
							<div className="stat-title text-white">
								New Registers
							</div>
							<div className="stat-value">1,200</div>
							<div className="stat-desc text-white">
								↘︎ 90 (14%)
							</div>
						</div>
					</div>
					<div className="stats h-1/2 w-full rounded-[0px] text-white backdrop-blur-lg">
						<div className="stat">
							<div className="stat-figure text-secondary">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									className="inline-block h-8 w-8 stroke-current text-white"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									></path>
								</svg>
							</div>
							<div className="stat-title text-white">
								Downloads
							</div>
							<div className="stat-value">31K</div>
							<div className="stat-desc text-white">
								Jan 1st - Feb 1st
							</div>
						</div>

						<div className="stat">
							<div className="stat-figure text-secondary">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									className="inline-block h-8 w-8 stroke-current text-white"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
									></path>
								</svg>
							</div>
							<div className="stat-title text-white">
								New Users
							</div>
							<div className="stat-value">4,200</div>
							<div className="stat-desc text-white">
								↗︎ 400 (22%)
							</div>
						</div>

						<div className="stat">
							<div className="stat-figure text-secondary">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									className="inline-block h-8 w-8 stroke-current text-white"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
									></path>
								</svg>
							</div>
							<div className="stat-title text-white">
								New Registers
							</div>
							<div className="stat-value">1,200</div>
							<div className="stat-desc text-white">
								↘︎ 90 (14%)
							</div>
						</div>

						<div className="stat">
							<div className="stat-figure text-secondary">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									className="inline-block h-8 w-8 stroke-current text-white"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
									></path>
								</svg>
							</div>
							<div className="stat-title text-white">
								New Registers
							</div>
							<div className="stat-value">1,200</div>
							<div className="stat-desc text-white">
								↘︎ 90 (14%)
							</div>
						</div>
					</div>
				</div>
				<div className="lg flex h-1/2 w-full rounded-lg shadow-2xl backdrop-blur-lg"></div>
				<div className="flex h-full w-full flex-row gap-6">
					<div className="flex h-1/2 w-1/2 rounded-lg shadow-2xl backdrop-blur-lg">
						HELLO WORLD
					</div>
					<div className="flex h-1/2 w-1/2 rounded-lg shadow-2xl backdrop-blur-lg">
						HELLO WORLD
					</div>
				</div>
			</div>
		</div>
	);
}

export default LeanSixSigma;
