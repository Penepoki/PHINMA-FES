import CollegeCards from "../../../Components/Dashboard Components/HR Components/College Cards";
import DashboardHeader from "../../../Components/Dashboard Components/Dashboard Header";

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
      <DashboardHeader />

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
