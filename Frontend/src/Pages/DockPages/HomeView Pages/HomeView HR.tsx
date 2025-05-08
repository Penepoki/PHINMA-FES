import CollegeCards from "../../../Components/Dashboard Components/HR Components/College Cards";

const subjects = [
  { name: "CITE", image: null },
  { name: "CAHS", image: null },
  { name: "CMA", image: null },
  { name: "CCJE", image: null },
  { name: "COED", image: null },
  { name: "SHS", image: null },
  { name: "etc", image: null },
  { name: "etc", image: null },
  { name: "etc", image: null },
  { name: "etc", image: null },
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
        <CollegeCards
          subjects={subjects}
        />
      </div>
    </div>
  );
}

export default Home;
