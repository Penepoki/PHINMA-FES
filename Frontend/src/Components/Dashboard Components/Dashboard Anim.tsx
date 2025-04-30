import Shape_1 from "../../assets/Dashboard Page Assets/IShape-1.svg";
import Shape_2 from "../../assets/Dashboard Page Assets/IShape-2.svg";
import Shape_3 from "../../assets/Dashboard Page Assets/IShape-3.svg";

const DashboardAnimation = () => {
  return (
    <div className="absolute top-0 left-0 h-screen w-screen overflow-hidden z-1">
      <img
        src={Shape_1}
        id="Shape-3"
        alt="Shape"
        className="absolute top-0 left-[-200px] w-auto h-screen opacity-80 z-10 blur-lg"
      />
      <img
        src={Shape_2}
        id="Shape-2"
        alt="Shape"
        className="absolute top-0 left-[-200px] w-auto h-screen opacity-80 z-20 blur-lg"
      />
      <img
        src={Shape_3}
        id="Shape-1"
        alt="Shape"
        className="absolute top-0 left-[-200px] w-auto h-screen opacity-85 z-30 blur-lg"
      />
    </div>
  );
};

export default DashboardAnimation;
