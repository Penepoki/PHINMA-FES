import Plogo from "../../assets/Landing Page Assets/PHINMA-Ed-Logodm.png";
import Plogo2 from "../../assets/Landing Page Assets/phinma-icon.png";
import Clogo from "../../assets/Landing Page Assets/CITE_Logo1.png";

function LoginHeader() {
  return (
    <header
      className="fixed flex justify-center items-center w-full top-0 mx-auto lg:left-0 lg:space-x-5 h-[20%] z-10"
      style={{
        background:
          "linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0))",
      }}
    >
      <div>
        {/* Large Screen Logo */}
        <img src={Plogo} alt="Logo 1" className="hidden md:block w-75 h-auto" />
        {/* Small Screen Logo */}
        <img
          src={Plogo2}
          alt="Logo 1 Small"
          className="block md:hidden size-25"
        />
      </div>
      <img src={Clogo} alt="Logo 2" className="size-25" />
    </header>
  );
}

export default LoginHeader;
