type Subject = {
	name: string;
	image?: string | null;
	bgColor?: string;
	textColor?: string;
	isAddCard?: boolean;
};

const SubjectCard: React.FC<Subject> = ({
	name,
	image,
	bgColor = "backdrop-hue-700",
	textColor = "text-white",
	isAddCard = false,
}) => {
	if (isAddCard) {
		return (
			<div
				className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-xl bg-green-600 p-5 text-white shadow-2xl hover:scale-105 hover:bg-green-700"
				onClick={() => {
					// Open add new subject modal or handle logic here
					console.log("Add new subject clicked");
				}}
			>
				<div className="flex flex-col items-center">
					<div className="flex size-30 items-center justify-center rounded-full bg-white text-5xl font-bold text-green-600">
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
		<div className="flex h-full w-full flex-col items-center justify-center rounded-xl p-5 shadow-2xl backdrop-blur-lg backdrop-hue-rotate-100 hover:scale-105">
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

const SubjectCards: React.FC<{
	subjects: Subject[];
}> = ({ subjects }) => {
	return (
		<>
			{/* Desktop View: 4 Cards Per Row */}
			<div className="mx-6 mt-6 flex flex-wrap justify-center gap-6">
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
