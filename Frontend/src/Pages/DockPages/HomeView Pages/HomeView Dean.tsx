import { useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import YearCard from "../../../Components/Dashboard Components/Dean Components/Year Card";

const PieChart = () => {
  const data = {
    labels: ["Red", "Blue", "Yellow"],
    datasets: [
      {
        label: "My First Dataset",
        data: [33, 33, 33],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        hoverBackgroundColor: ["#FF4365", "#2593D1", "#FFC130"],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Important for flex containers!
  };

  return (
    <div
      className="
        flex flex-col
        w-full h-full
        text-center
        justify-center items-center
      "
    >
      <h3
        className="
          mb-2
          text-lg
          sm:text-xl
        "
      >
        Student Doing
      </h3>
      <div
        className="
          w-full h-full
          relative
        "
      >
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

// Register chart components
ChartJS.register(ArcElement, Tooltip, Legend);

interface HomeProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const Home: React.FC<HomeProps> = ({ activeView, setActiveView }) => {
  console.log("Active View:", activeView); // Debugging line

  const yearData = [
    {
      year: "1st",
      ratio: "16/32",
    },
    {
      year: "2nd",
      ratio: "34/72",
    },
    {
      year: "3rd",
      ratio: "52/52",
    },
    {
      year: "4th",
      ratio: "11/12",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevCard = () => {
    setCurrentIndex((prev) => (prev === 0 ? yearData.length - 1 : prev - 1));
  };

  const nextCard = () => {
    setCurrentIndex((prev) => (prev === yearData.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className="
        flex flex-col z-10
        w-full h-full
        home-page justify-center items-center
      "
    >
      <header
        className="
          flex z-1
          w-full h-[15%]
          pl-12
          border-gray-600 border-b-2
          shadow-2xl
          absolute top-0 justify-start items-end backdrop-blur-lg gap-6
          md:h-[15%]
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

      <p
        className="
          mt-10

          mb-8
          text-lg text-gray-300
          sm:text-xl
          md:mb-10
          md:mt-20
        "
      >
        Recently Evaluated Faculty:
      </p>

      <div
        onClick={() => setActiveView("evaluation")}
        className="
          flex flex-row overflow-x-auto
          w-full h-1/3
          items-center justify-center hover:scale-101
          sm:h-[30vh]
        "
      >
        <div
          id="box1"
          className="
            flex flex-col
            w-1/3 h-full
            p-5
            rounded-xl
            shadow-2xl
            justify-center items-center backdrop-blur-lg backdrop-hue-rotate-100
          "
        >
          <div
            className="
              flex flex-col
              items-center
            "
          >
            {" "}
            {/* Ensure vertical stacking */}
            <div className="avatar">
              <div className="w-24 rounded-full">
                <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
              </div>
            </div>
            <div
              className="
                mt-4
                text-center
              "
            >
              {" "}
              {/* Add spacing & center text */}
              <span
                className="
                  text-3xl font-bold text-white
                "
              >
                Dylan Smalls
              </span>
            </div>
          </div>
        </div>

        <div
          id="box2"
          className="
            w-1/3 h-full
            p-5
            text-white
            rounded-xl
            shadow-2xl
            backdrop-blur-lg backdrop-hue-rotate-300
          "
        >
          <PieChart />
        </div>
        <div
          id="box3"
          className="
            w-1/3 h-full
            p-5
            text-white
            rounded-xl
            shadow-2xl
            backdrop-blur-lg backdrop-hue-rotate-400
          "
        >
          <PieChart />
        </div>
      </div>

      <div
        className="
          mt-5
          text-center
        "
      >
        <p
          className="
            text-lg text-gray-300
            sm:text-xl
            mb-8
            mt-3
          "
        >
          Current SFF Status: Time and date
        </p>

        {/* Desktop View (Grid) */}
        <div
          className="
            hidden flex-row
            justify-center items-center gap-6
            md:flex
          "
        >
          {yearData.map(({ year, ratio }) => (
            <YearCard
              key={year}
              year={year}
              ratio={ratio}
              setActiveView={setActiveView}
            />
          ))}
        </div>

        {/* Mobile View (Carousel) */}
        <div
          className="
            flex
            items-center justify-center gap-4
            md:hidden
          "
        >
          <button
            onClick={prevCard}
            className="
              p-2
              text-primary
              bg-white
              rounded-full
            "
          >
            ◀
          </button>

          <YearCard
            year={yearData[currentIndex].year}
            ratio={yearData[currentIndex].ratio}
            setActiveView={setActiveView}
          />

          <button
            onClick={nextCard}
            className="
              p-2
              text-primary
              bg-white
              rounded-full
            "
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
