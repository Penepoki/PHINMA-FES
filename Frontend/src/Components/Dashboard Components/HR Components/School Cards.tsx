type Schools = {
	name: string;
	image?: string | null;
	bgColor?: string;
	textColor?: string;
	isAddCard?: boolean;
	onClick?: () => void;
};

const SchoolCard: React.FC<Schools> = ({
	name,
	image,
	bgColor = "backdrop-hue-700",
	textColor = "text-white",
	isAddCard = false,
	onClick,
}) => {
	if (isAddCard) {
		return (
			<div
				className="backdrop-blue-lg flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-xl p-5 text-white shadow-2xl backdrop-hue-rotate-300 hover:scale-105"
				onClick={() => {
					// Open add new subject modal or handle logic here
					console.log("Add new subject clicked");
				}}
			>
				<div className="flex flex-col items-center">
					<div className="flex size-30 items-center justify-center rounded-full text-9xl text-white">
						+
					</div>
					<div className="mt-4 text-center">
						<span className="text-2xl font-bold">{name}</span>
					</div>
				</div>
			</div>
		);
	}

	// Regular card
	return (
		<div
			className="flex h-full w-full flex-col items-center justify-center rounded-xl p-5 shadow-2xl backdrop-blur-lg backdrop-hue-rotate-400 hover:scale-105"
			onClick={onClick}
		>
			<div className="flex flex-col items-center">
				<div
					className={`${bgColor} text-neutral-content flex size-30 items-center justify-center rounded-full`}
				>
					{image ? (
						<img
							src={image}
							alt={name}
							className="h-full w-full rounded-full object-cover"
						/>
					) : (
						<span className="text-[80px]">
							{name?.charAt(0) || "?"}
						</span>
					)}
				</div>

				<div className="mt-4 text-center">
					<span className={`text-3xl font-bold ${textColor}`}>
						{name}
					</span>
				</div>
			</div>
		</div>
	);
};

const SchoolCards: React.FC<{
	school: Schools[];
	onSchoolClick?: (schoolName: string) => void;
}> = ({ school, onSchoolClick }) => {
	return (
		<div className="mt-6 flex h-full w-screen flex-col flex-wrap justify-center gap-6 md:flex-row">
			{school.map((school, idx) => (
				<div key={idx} className="h-1/2 w-full md:w-1/5">
					<SchoolCard
						{...school}
						onClick={() =>
							!school.isAddCard && onSchoolClick?.(school.name)
						}
					/>
				</div>
			))}
		</div>
	);
};

export default SchoolCards;
