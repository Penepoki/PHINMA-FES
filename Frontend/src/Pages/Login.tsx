import Background from "../assets/Landing Page Assets/Background4.png";
import LoginHeader from "../Components/Login Components/Login Header.tsx";
import BackgroundAnimation from "../Components/Login Components/Landing Page Anim.tsx";
import { AnimatedHeading } from "../Components/Login Components/Landing Page Anim.tsx";
import LoginCard from "../Components/Login Components/Login Card.tsx";

function Login() {
	return (
		<section id="login-section" data-theme="SJC">
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
			</div>
		</section>
	);
}

export default Login;
