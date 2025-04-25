function Home() {
  return (
    <div className="home-page flex flex-col justify-center items-center w-full h-full z-10">
      <div className="absolute flex top-0 w-full pl-12 justify-start items-end border-gray-600 border-b-2 backdrop-blur-lg backdrop-hue-rotate-1100 h-[20%] shadow-2xl gap-6 z-1">
        <h1 className="text-6xl font-bold text-white">Hi, HR</h1>
        <p className="text-gray-600">Welcome to the Home Page</p>
      </div>
      <p className="text-gray-500 mt-20">You are in HR View</p>
    </div>
  );
}

export default Home;
