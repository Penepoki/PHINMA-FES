import React from "react";

interface YearCardProps {
	year: string;
	ratio: string; // e.g. "16/32"
	setActiveView?: (view: string) => void;
}

const YearCard: React.FC<YearCardProps> = ({ year, ratio, setActiveView }) => {
	const [num, denom] = ratio.split("/").map(Number);
	const percentage =
		denom && !isNaN(num) && !isNaN(denom)
			? Math.round((num / denom) * 100)
			: 0;

	// Randomize animation duration between 3s to 5s
	// const duration = (Math.random() * 2 + 3).toFixed(2); // e.g., 3.47s

	// Optional: Random delay for more variation
	const delay = (Math.random() * 2).toFixed(2); // e.g., 0.83s

	return (
		<div
			onClick={() => setActiveView?.("studentEval")}
			className="float-breathe flex cursor-pointer items-center justify-center rounded-full shadow-2xl backdrop-blur-lg backdrop-hue-rotate-700 hover:scale-105"
			style={{
				// animationDuration: `${duration}s`,
				animationDelay: `${delay}s`,
			}}
		>
			<div
				className="radial-progress h-45 w-45 text-white shadow-2xl md:h-[14vw] md:w-[14vw]"
				style={
					{
						"--value": percentage,
					} as React.CSSProperties
				}
				aria-valuenow={percentage}
				role="progressbar"
			>
				<div className="flex flex-col items-center justify-center text-center">
					<span className="text-xl font-bold sm:text-2xl">
						{year} Year
					</span>
					<span className="text-xl font-bold sm:text-2xl">
						{percentage}%
					</span>
					<span className="text-sm text-gray-300">{ratio}</span>
				</div>
			</div>
		</div>
	);
};

export default YearCard;
