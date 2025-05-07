type Subject = {
  name: string;
  image?: string | null;
  bgColor?: string;
  textColor?: string;
};

const SubjectCard: React.FC<
  Subject
> = ({
  name,
  image,
  bgColor = "backdrop-hue-700",
  textColor = "text-white",
}) => {
  return (
    <div className="flex flex-col justify-center items-center w-full h-full p-5 backdrop-blur-lg backdrop-hue-rotate-100 rounded-xl shadow-2xl hover:scale-105">
      <div className="flex flex-col items-center">
        <div
          className={`${bgColor} text-neutral-content size-30 rounded-full flex items-center justify-center`}
        >
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
            className={`text-3xl font-bold ${textColor}`}
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
}> = ({ subjects }) => {
  return (
    <>
      {/* Desktop View: 4 Cards Per Row */}
      <div className="flex flex-wrap justify-center gap-6 mx-6 mt-6">
        {subjects.map(
          (subject, idx) => (
            <div
              key={idx}
              className="w-full sm:w-1/2 lg:w-1/4"
            >
              <SubjectCard
                {...subject}
              />
            </div>
          )
        )}
      </div>
    </>
  );
};

export default SubjectCards;
