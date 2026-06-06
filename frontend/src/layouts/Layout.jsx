import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({
	children,
	showFooter = true,
}) {
	const [user, setUser] = useState(null);
	const [role, setRole] = useState(1);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const location = useLocation();

	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
	const API_VERSION = import.meta.env.VITE_API_VERSION || "";

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await fetch(
					`${API_BASE_URL}${API_VERSION}/authUser/getUserDetails`,
					{
						method: "GET",
						credentials: "include",
					}
				);

				if (!response.ok) {
					setUser(null);
					setRole(1);
					setIsAuthenticated(false);
					return;
				}

				const data = await response.json();
				if (data?.success && data?.user) {
					setUser(data.user);
					setRole(data.user.role ?? 1);
					setIsAuthenticated(true);
				} else {
					setUser(null);
					setRole(1);
					setIsAuthenticated(false);
				}
			} catch (error) {
				setUser(null);
				setRole(1);
				setIsAuthenticated(false);
			}
		};

		fetchUser();
	}, [API_BASE_URL, API_VERSION, location.pathname]);

	const handleLogout = async () => {
		try {
			await fetch(`${API_BASE_URL}${API_VERSION}/authUser/logout`, {
				method: "POST",
				credentials: "include",
			});
		} catch (error) {
			console.error("Logout failed", error);
		}
		setUser(null);
		setRole(1);
		setIsAuthenticated(false);
	};

	const headerProps = useMemo(
		() => ({
			role,
			isAuthenticated,
			user,
			notifications: 0,
			onLogout: handleLogout,
		}),
		[role, isAuthenticated, user]
	);

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900">
			<Header {...headerProps} />
			<main className="min-h-[70vh]">{children}</main>
			{showFooter && <Footer />}
		</div>
	);
}
