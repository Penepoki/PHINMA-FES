const SubjectCard = ({
  name,
  image,
  bgColor = "backdrop-hue-700",
  textColor = "text-white",
}) => {
  return (
    <div className="flex flex-col justify-center items-center w-1/3 h-full p-5 backdrop-blur-lg backdrop-hue-rotate-100 rounded-xl shadow-2xl">
      <div className="flex flex-col items-center">
        {/* Profile Image */}
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
            <span className="text-[80px]">{name?.charAt(0) || "?"}</span>
          )}
        </div>

        {/* Name */}
        <div className="mt-4 text-center">
          <span className={`text-3xl font-bold ${textColor}`}>{name}</span>
        </div>
      </div>
    </div>
  );
};

export default SubjectCard;
