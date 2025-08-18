import Background from "../assets/Landing Page Assets/Background4.png";
import LoginHeader from "../Components/Login Components/Login Header.tsx";
import BackgroundAnimation from "../Components/Login Components/Landing Page Anim.tsx";
import { AnimatedHeading } from "../Components/Login Components/Landing Page Anim.tsx";
import LoginCard from "../Components/Login Components/Login Card.tsx";

function Login() {
  return (
    <section id="login-section" data-theme="SJC" className="relative">
      {/* Background Animation */}
      <BackgroundAnimation />

      {/* Login Background */}
      <div
        className="flex min-h-screen items-center justify-center bg-cover bg-center text-center relative"
        style={{ backgroundImage: `url(${Background})` }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/10 to-transparent z-0"></div>

        {/* Content */}

        <LoginHeader />
        <AnimatedHeading />
        <LoginCard />

        {/* Minimalistic Bottom Center Filter */}
        <div className="fixed bottom-3 z-10 text-xs text-[#888888] md:text-lg">
          © 2025 PHINMA Saint Jude College Manila. All rights reserved.
        </div>
      </div>
    </section>
  );
}

export default Login;
