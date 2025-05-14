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
				className="flex min-h-screen items-center justify-center bg-cover bg-center text-center"
				style={{ backgroundImage: `url(${Background})` }}
			>
				<LoginHeader />

				{/* Using AnimatedHeading here */}
				<AnimatedHeading />

				{/* Login or SignUp Form */}
				<LoginCard />

				{/* Minimalistic Bottom Center Filter */}
				<div className="fixed bottom-3 z-10 text-xs text-gray-400 md:text-sm">
					© 2025 PHINMA Saint Jude College Manila. All rights
					reserved.
				</div>
			</div>
		</section>
	);
}

export default Login;
