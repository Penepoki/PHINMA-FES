import Plogo from "../../assets/Landing Page Assets/PHINMA-Ed-Logodm.png";
import Plogo2 from "../../assets/Landing Page Assets/phinma-icon.png";

function LoginHeader() {
  return (
    <header
      className="fixed top-0 z-10 mx-auto flex h-[20%] w-full items-center justify-center lg:left-0 lg:space-x-5"
      style={{
        background: "linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0))",
      }}
    >
      <div>
        {/* Large Screen Logo */}
        <img src={Plogo} alt="Logo 1" className="hidden h-auto w-100 md:block" />
        {/* Small Screen Logo */}
        <img src={Plogo2} alt="Logo 1 Small" className="block size-40 md:hidden" />
      </div>
    </header>
  );
}

export default LoginHeader;
