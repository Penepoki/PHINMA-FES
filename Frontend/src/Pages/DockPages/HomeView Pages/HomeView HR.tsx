import SubjectCarousel from "../../../Components/Dashboard Components/Student Components/Subject Cards";

const subjects = [
  { name: "Mathematics", image: null },
  { name: "Biology", image: null },
  { name: "Chemistry", image: null },
  { name: "Chemistry", image: null },
  { name: "Chemistry", image: null },
  { name: "Chemistry", image: null },
  { name: "Chemistry", image: null },
  { name: "Chemistry", image: null },
  { name: "Chemistry", image: null },
  { name: "Chemistry", image: null },
  // ...more subjects
];

function Home() {
  return (
    <div className="home-page flex flex-col justify-center items-center w-full h-full gap-y-6 z-10">
      <header
        className="
          flex z-1
          w-full h-[15%]
          pl-12
          border-gray-600 border-b-2
          shadow-2xl
          absolute top-0 justify-start items-end backdrop-blur-lg gap-6
        "
      >
        <h1
          className="
            text-5xl font-bold text-white
            sm:text-6xl
          "
        >
          Hi, Renzo
        </h1>
        <p
          className="
            text-lg text-gray-300
            sm:text-xl
          "
        >
          Welcome to the Home Page
        </p>
      </header>

      <div className="flex flex-col items-center justify-start w-auto h-auto overflow-x-auto mt-35 mb-20">
        <p className="text-gray-300 text-lg mt-0">
          Subject List:
        </p>
        <SubjectCarousel
          subjects={subjects}
        />
      </div>
    </div>
  );
}

export default Home;
