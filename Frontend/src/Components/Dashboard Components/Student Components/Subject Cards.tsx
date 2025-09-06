type Subject = {
    name: string;
    image?: string | null;
    bgColor?: string;
    textColor?: string;
};

const SubjectCard: React.FC<
    Subject & {
    onClick?: () => void;
    isCompleted: boolean;
}
> = ({
         name,
         image,
         bgColor = "backdrop-hue-700",
         textColor = "text-white",
         onClick,
         isCompleted,
}) => {
    return (
        <div
            onClick={onClick}
            className={`flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-xl p-5 shadow-2xl backdrop-blur-lg backdrop-hue-rotate-100 transition-transform hover:scale-105 ${
                isCompleted ? "backdrop-hue-rotate-700" : bgColor
            }`}
        >
            <div className="flex flex-col items-center">
                <div className="text-neutral-content flex size-30 items-center justify-center rounded-full">
                    {image ? (
                        <img src={image} alt={name} className="h-full w-full rounded-full object-cover"/>
                    ) : (
                        <span className="text-[80px]">{name?.charAt(0) || "?"}</span>
                    )}
                </div>

                <div className="mt-4 text-center">
          <span className={`text-3xl font-bold ${isCompleted ? "text-white" : textColor}`}>
            {name}
          </span>
                </div>
            </div>
        </div>
    );
};

const SubjectCards: React.FC<{
    subjects: Subject[];
    onClick?: (subjectName: string) => void;
    completedSubjects: Set<string>;
}> = ({ subjects, onClick, completedSubjects }) => {
    return (
        <div className="w-full rounded-xl bg-black/20">
            <div className="flex flex-col items-center">
                <p className="mt-6 text-xl text-gray-300">Subject List:</p>
                <div className="flex flex-wrap justify-center gap-6 px-6 py-6 md:mt-6 md:px-0">
                    {subjects.map((subject, idx) => (
                        <div key={idx} className="w-full sm:w-1/2 lg:w-1/4">
                            <SubjectCard
                                {...subject}
                                onClick={() => onClick?.(subject.name)}
                                isCompleted={completedSubjects.has(subject.name)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SubjectCards;
