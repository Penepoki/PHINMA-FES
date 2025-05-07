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
      className={`flex flex-col justify-center items-center w-full h-full p-5 backdrop-blur-lg backdrop-hue-rotate-100 rounded-xl shadow-2xl hover:scale-105 cursor-pointer transition-transform ${
        isCompleted
          ? "backdrop-hue-rotate-700"
          : bgColor
      }`}
    >
      <div className="flex flex-col items-center">
        <div className="text-neutral-content size-30 rounded-full flex items-center justify-center">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-[80px]">
              {name?.charAt(0) || "?"}
            </span>
          )}
        </div>

        <div className="mt-4 text-center">
          <span
            className={`text-3xl font-bold ${isCompleted ? "text-white" : textColor}`}
          >
            {name}
          </span>
        </div>
      </div>
    </div>
  );
};

const SubjectCards: React.FC<{
  subjects: Subject[];
  onClick?: (
    subjectName: string
  ) => void;
  completedSubjects: Set<string>;
}> = ({
  subjects,
  onClick,
  completedSubjects,
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-6 mx-6 md:mx-0 mt-6">
      {subjects.map((subject, idx) => (
        <div
          key={idx}
          className="w-full sm:w-1/2 lg:w-1/4"
        >
          <SubjectCard
            {...subject}
            onClick={() =>
              onClick?.(subject.name)
            }
            isCompleted={completedSubjects.has(
              subject.name
            )}
          />
        </div>
      ))}
    </div>
  );
};

export default SubjectCards;
