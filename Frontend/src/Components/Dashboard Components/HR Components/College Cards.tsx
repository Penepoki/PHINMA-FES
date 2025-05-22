type Subject = {
	name: string;
	fullname: string;
	image?: string | null;
	bgColor?: string;
	textColor?: string;
	isAddCard?: boolean;
};

const SubjectCard: React.FC<Subject> = ({
	name,
	fullname,
	image,
	bgColor = "backdrop-hue-700",
	textColor = "text-white",
	isAddCard = false,
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
		<div className="flex h-full w-full flex-col items-center justify-center rounded-xl p-5 shadow-2xl backdrop-blur-lg backdrop-hue-rotate-300 hover:scale-105">
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

				<div className="mt-4 flex flex-col text-center">
					<span className={`text-3xl font-bold ${textColor}`}>
						{name}
					</span>
					<span className={`text-md mt-2 text-gray-400`}>
						{fullname}
					</span>
				</div>
			</div>
		</div>
	);
};

const SubjectCards: React.FC<{
	subjects: Subject[];
}> = ({ subjects }) => {
	return (
		<>
			{/* Desktop View: 4 Cards Per Row */}
			<div className="mx-6 mt-6 flex h-full flex-wrap justify-center gap-6">
				{subjects.map((subject, idx) => (
					<div key={idx} className="w-full sm:w-1/2 lg:w-1/4">
						<SubjectCard {...subject} />
					</div>
				))}
			</div>
		</>
	);
};

export default SubjectCards;
