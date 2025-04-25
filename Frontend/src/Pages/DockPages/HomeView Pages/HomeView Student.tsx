import SubjectCard from "../../../Components/Dashboard Components/Student Components/Subject Card Template";

function Home() {
  return (
    <div className="home-page flex flex-col justify-center items-center w-full h-full z-10">
      <div className="absolute flex top-0 w-full pl-12 justify-start items-end border-gray-600 border-b-2 backdrop-blur-lg backdrop-hue-rotate-1100 h-[20%] shadow-2xl gap-6 z-1">
        <h1 className="text-6xl font-bold text-white">Hi, Renzo Angelo Cua</h1>
        <p className="text-gray-200">Welcome to the Home Page</p>
      </div>

      <p className="text-gray-500 mt-0">Subject List:</p>

      <div className="flex flex-row overflow-x-auto md:flex-row items-center justify-center w-full h-1/3 md:gap-6">
        <SubjectCard name="SSP" image="" />
        <SubjectCard name="Networking 2" image="" />
        <SubjectCard name="OOP 2" image="" />
        <SubjectCard name="HCI" image="" />
        <SubjectCard name="SocProf" image="" />
        <SubjectCard name="SIA" image="" />
      </div>
    </div>
  );
}

export default Home;
