interface ResourceGroupProps {
	setActiveView: (view: string) => void;
}

function ResourceGroup({ setActiveView }: ResourceGroupProps) {
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
			<div className="z-10 flex h-full w-full flex-col items-center justify-center gap-6 p-0 md:flex-row md:p-6">
				<div className="rg-container md:gap-y-6 md:p-6">
					<h2 className="mb-4 text-4xl font-bold">Courses</h2>
					<span className="text-xl text-gray-300">
						Number of current courses:
					</span>
					<span className="text-8xl">0</span>
				</div>
				<div className="rg-container md:gap-y-6 md:p-6">
					<h2 className="mb-4 text-4xl font-bold">Subjects</h2>
					<span className="text-xl text-gray-300">
						Number of current subjects:
					</span>
					<span className="text-8xl">0</span>
				</div>
				<div className="rg-container md:gap-y-6 md:p-6">
					<h2 className="mb-4 text-4xl font-bold">Rooms</h2>
					<span className="text-xl text-gray-300">
						Number of current rooms:
					</span>
					<span className="text-8xl">0</span>
				</div>
				<div className="rg-container md:gap-y-6 md:p-6">
					<h2 className="mb-4 text-4xl font-bold">Schedules</h2>
					<span className="text-xl text-gray-300">
						Number of current schedules:
					</span>
					<span className="text-8xl">0</span>
				</div>
			</div>
		</div>
	);
}

export default ResourceGroup;
