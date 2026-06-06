import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logoBlue from "../assets/Rent My Car(Blue).png";

const Logo = () => (
	<div className="flex items-center gap-2">
		<img src={logoBlue} alt="Rent My Car" className="h-7 w-auto" />
		<span className="text-lg font-semibold text-[#0D3778]">Rent My Car</span>
	</div>
);

const Avatar = ({ name }) => (
	<div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0D3778] text-sm font-semibold text-white">
		{name?.slice(0, 1)?.toUpperCase() || "U"}
	</div>
);

const NotificationBell = ({ count = 0, onClick }) => (
	<button
		type="button"
		onClick={onClick}
		className="relative hover:opacity-75 transition bg-transparent border-none cursor-pointer"
		aria-label="View notifications"
	>
		<svg
			viewBox="0 0 24 24"
			className="h-5 w-5 text-slate-600"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path
				d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5"
				stroke="currentColor"
				strokeWidth="1.8"
				strokeLinecap="round"
			/>
			<path
				d="M9 17a3 3 0 0 0 6 0"
				stroke="currentColor"
				strokeWidth="1.8"
				strokeLinecap="round"
			/>
		</svg>
		{count > 0 && (
			<span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
				{count}
			</span>
		)}
	</button>
);

const NavLink = ({ to, children, active }) => (
	<Link
		to={to}
		className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
			active
				? "bg-[#dbeafe] text-[#0D3778]"
				: "text-slate-600 hover:bg-slate-100"
		}`}
	>
		{children}
	</Link>
);

const ProfileMenu = ({ user, roleLabel, onLogout, avatarAfterName = false }) => {
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();

	const getProfileRoute = () => {
		switch (roleLabel) {
			case "Admin":
				return "/admin-profile";
			case "Owner":
				return "/owner-profile";
			case "Customer":
				return "/customer-profile";
			default:
				return "/customer-profile";
		}
	};

	const AvatarDiv = () => (
		<div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#0D3778] text-white font-semibold shrink-0">
			{user?.avatar || user?.profile_image ? (
				<img
					src={user.avatar || user.profile_image}
					alt={user?.first_name || "User"}
					className="h-full w-full object-cover"
				/>
			) : (
				<span className="text-sm">
					{`${user?.first_name?.slice(0, 1) || ""}${user?.last_name?.slice(0, 1) || ""}`.toUpperCase() || "U"}
				</span>
			)}
		</div>
	);

	const handleLogoutClick = () => {
		onLogout();
		navigate("/login");
	};

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setOpen((prev) => !prev)}
				className="flex items-center gap-2.5 bg-transparent text-sm transition hover:opacity-80"
			>
				{!avatarAfterName && <AvatarDiv />}
				<div className="flex flex-col items-start">
					<span className="text-sm font-medium text-[#0D3778]">
						{user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "User"}
					</span>
					<div className="flex items-center gap-1">
						<span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
						<span className="text-xs text-green-600 font-medium">Online</span>
					</div>
				</div>
				{avatarAfterName && <AvatarDiv />}
				<svg
					viewBox="0 0 20 20"
					className="h-3.5 w-3.5 text-slate-900 shrink-0"
					fill="currentColor"
					aria-hidden="true"
				>
					<path d="M5.25 7.5 10 12.25 14.75 7.5" />
				</svg>
		</button>

			{open && (
				<div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1.5 shadow-lg">
					<Link
						to={getProfileRoute()}
						className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
					>
						<svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
							<path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.3 0-6 2-6 4.5V20h12v-1.5c0-2.5-2.7-4.5-6-4.5Z" />
						</svg>
						<span>Profile</span>
					</Link>
					<Link
						to="/admin/settings"
						className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
					>
						<svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
							<path d="M12 8a1 1 0 0 1 1 1v2h2a1 1 0 0 1 0 2h-2v2a1 1 0 0 1-2 0v-2H9a1 1 0 0 1 0-2h2V9a1 1 0 0 1 1-1Zm0-6a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
						</svg>
						<span>Settings</span>
					</Link>
					<hr className="my-1.5 border-slate-200" />
					<button
						type="button"
						onClick={handleLogoutClick}
						className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
					>
						<svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
							<path d="M16 13v-2H7V8l-5 4 5 4v-3h9ZM20 3h-9c-1.1 0-2 .9-2 2v4h2V5h9v14h-9v-4H9v4c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Z" />
						</svg>
						<span>Logout</span>
					</button>
				</div>
			)}
		</div>
	);
};

export default function Header({
	role = 1,
	user,
	isAuthenticated = false,
	onLogout,
	notifications = 0,
}) {
	const [mobileOpen, setMobileOpen] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();

	const normalizedRole = useMemo(() => {
		if (typeof role === "string") return role.toLowerCase();
		if (role === 3) return "admin";
		if (role === 2) return "owner";
		return "customer";
	}, [role]);

	const mobileHiddenClass =
		normalizedRole === "customer" || !isAuthenticated ? "md:hidden" : "lg:hidden";

	const roleLabel = useMemo(() => {
		if (normalizedRole === "admin") return "Admin";
		if (normalizedRole === "owner") return "Owner";
		return "Customer";
	}, [normalizedRole]);

	return (
		<header className="sticky top-0 z-50 w-full bg-white shadow-sm">
			<div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
				<Link to="/" className="flex items-center">
					<Logo />
				</Link>

				<div className="flex items-center gap-4">
					{(normalizedRole === "customer" || !isAuthenticated) && (
						<nav className="flex items-center gap-4">
							<div className="hidden items-center gap-2 md:flex">
								<NavLink to="/vehicles" active={location.pathname === "/vehicles"}>Browse Cars</NavLink>
								<NavLink to="/how-it-works" active={location.pathname === "/how-it-works"}>How It Works</NavLink>
								<NavLink to="/become-a-host" active={location.pathname === "/become-a-host"}>Become a Host</NavLink>
								<NavLink to="/contact" active={location.pathname === "/contact"}>Contact Us</NavLink>
							</div>
							{isAuthenticated ? (
								<div className="hidden items-center gap-4 md:flex">
									<NotificationBell count={notifications} onClick={() => navigate('/notifications')} />
									<ProfileMenu
										user={user}
										roleLabel={roleLabel}
										onLogout={onLogout}
										avatarAfterName={true}
									/>
								</div>
							) : (
								<div className="hidden items-center gap-3 md:flex">
									<Link
										to="/login"
										className="rounded-full border-2 border-[#0D3778] px-4 py-1.5 text-sm font-semibold text-[#0D3778] transition hover:bg-[#dbeafe]"
									>
										Login
									</Link>
									<Link
										to="/signup"
										className="rounded-full bg-[#0D3778] px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0B2F68]"
									>
										Sign Up
									</Link>
								</div>
							)}
						</nav>
					)}

					{normalizedRole === "owner" && isAuthenticated && (
						<nav className="flex items-center gap-4">
							<div className="hidden items-center gap-2 lg:flex">
								<NavLink to="/owner/dashboard" active={location.pathname === "/owner/dashboard"}>Dashboard</NavLink>
								<NavLink to="/owner/vehicles" active={location.pathname === "/owner/vehicles"}>My Vehicles</NavLink>
								<NavLink to="/owner/vehicles/new" active={location.pathname === "/owner/vehicles/new" || location.pathname === "/add-vehicle"}>Add Vehicle</NavLink>
								<NavLink to="/booking-history" active={location.pathname === "/booking-history"}>Bookings</NavLink>
								<NavLink to="/rental-history" active={location.pathname === "/rental-history"}>Earnings</NavLink>
							</div>
							<div className="hidden items-center gap-4 lg:flex">
								<NotificationBell count={notifications} onClick={() => navigate('/notifications')} />
								<ProfileMenu
									user={user}
									roleLabel={roleLabel}
									onLogout={onLogout}
									avatarAfterName={false}
								/>
							</div>
						</nav>
					)}

					{normalizedRole === "admin" && isAuthenticated && (
						<nav className="flex items-center gap-4">
							<div className="hidden items-center gap-2 lg:flex">
								<NavLink to="/admin/dashboard" active={location.pathname === "/admin/dashboard"}>
									Dashboard
								</NavLink>
								<NavLink to="/admin/users" active={location.pathname === "/admin/users"}>User</NavLink>
								<NavLink to="/admin/vehicles" active={location.pathname === "/admin/vehicles"}>Vehicle</NavLink>
								<NavLink to="/admin/booking" active={location.pathname === "/admin/booking"}>Booking</NavLink>
								<NavLink to="/admin/report" active={location.pathname === "/admin/report"}>Reports</NavLink>
							</div>
							<div className="hidden items-center gap-4 lg:flex">
								<NotificationBell count={notifications} onClick={() => navigate('/notifications')} />
								<ProfileMenu
									user={user}
									roleLabel={roleLabel}
									onLogout={onLogout}
									avatarAfterName={false}
								/>
							</div>
						</nav>
					)}

					<button
						type="button"
						onClick={() => setMobileOpen((prev) => !prev)}
						className={`${mobileHiddenClass} inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-100`}
						aria-label="Toggle navigation"
					>
						{mobileOpen ? (
							<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M6 6l12 12M18 6l-12 12" />
							</svg>
						) : (
							<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M4 6h16M4 12h16M4 18h16" />
							</svg>
						)}
					</button>
				</div>
			</div>

			{mobileOpen && (
				<div className={`${mobileHiddenClass} border-t border-slate-200 bg-white`}>
					<div className="mx-auto flex max-w-7xl flex-col gap-3 px-8 py-4">
						{(normalizedRole === "customer" || !isAuthenticated) && (
							<div className="flex flex-col gap-2">
								<Link to="/vehicles" className="text-sm font-medium text-slate-700">
									Browse Cars
								</Link>
								<Link to="/contact" className="text-sm font-medium text-slate-700">
									Contact Us
								</Link>
								<Link to="/how-it-works" className="text-sm font-medium text-slate-700">
									How It Works
								</Link>
								<Link to="/become-a-host" className="text-sm font-medium text-slate-700">
									Become a Host
								</Link>
								{isAuthenticated ? (
								<div className="flex items-center gap-3 pt-2">
									<NotificationBell count={notifications} onClick={() => navigate('/notifications')} />
									<ProfileMenu
										user={user}
										roleLabel={roleLabel}
										onLogout={onLogout}
										avatarAfterName={true}
									/>
								</div>
								) : (
									<div className="flex flex-col gap-2 pt-2">
										<Link
											to="/login"
											className="rounded-full border-2 border-[#0D3778] px-4 py-1.5 text-center text-sm font-semibold text-[#0D3778]"
										>
											Login
										</Link>
										<Link
											to="/signup"
											className="rounded-full bg-[#0D3778] px-4 py-1.5 text-center text-sm font-semibold text-white"
										>
											Sign Up
										</Link>
									</div>
								)}
							</div>
						)}

						{normalizedRole === "owner" && isAuthenticated && (
							<div className="flex flex-col gap-2">
								<Link to="/owner/dashboard" className={`text-sm font-medium ${location.pathname === "/owner/dashboard" ? "text-[#0D3778] font-semibold" : "text-slate-700"}`}>
									Dashboard
								</Link>
								<Link to="/owner/vehicles" className={`text-sm font-medium ${location.pathname === "/owner/vehicles" ? "text-[#0D3778] font-semibold" : "text-slate-700"}`}>
									My Vehicles
								</Link>
								<Link to="/owner/vehicles/new" className={`text-sm font-medium ${location.pathname === "/owner/vehicles/new" || location.pathname === "/add-vehicle" ? "text-[#0D3778] font-semibold" : "text-slate-700"}`}>
									Add Vehicle
								</Link>
								<Link to="/booking-history" className={`text-sm font-medium ${location.pathname === "/booking-history" ? "text-[#0D3778] font-semibold" : "text-slate-700"}`}>
									Bookings
								</Link>
								<Link to="/rental-history" className={`text-sm font-medium ${location.pathname === "/rental-history" ? "text-[#0D3778] font-semibold" : "text-slate-700"}`}>
									Earnings
								</Link>
								<Link to="/owner/reviews" className={`text-sm font-medium ${location.pathname === "/owner/reviews" ? "text-[#0D3778] font-semibold" : "text-slate-700"}`}>
									Reviews
								</Link>
								<div className="flex items-center gap-3 pt-2">
									<NotificationBell count={notifications} onClick={() => navigate('/notifications')} />
									<ProfileMenu
										user={user}
										roleLabel={roleLabel}
										onLogout={onLogout}
										avatarAfterName={false}
									/>
								</div>
							</div>
						)}

						{normalizedRole === "admin" && isAuthenticated && (
							<div className="flex flex-col gap-2">
								<Link to="/admin/dashboard" className={`text-sm font-medium ${location.pathname === "/admin/dashboard" ? "text-[#0D3778] font-semibold" : "text-slate-700"}`}>
									Dashboard
								</Link>
								<Link to="/admin/users" className={`text-sm font-medium ${location.pathname === "/admin/users" ? "text-[#0D3778] font-semibold" : "text-slate-700"}`}>
									User
								</Link>
								<Link to="/admin/vehicles" className={`text-sm font-medium ${location.pathname === "/admin/vehicles" ? "text-[#0D3778] font-semibold" : "text-slate-700"}`}>
									Vehicle
								</Link>
								<Link to="/admin/booking" className={`text-sm font-medium ${location.pathname === "/admin/booking" ? "text-[#0D3778] font-semibold" : "text-slate-700"}`}>
									Booking
								</Link>
								<Link to="/admin/report" className={`text-sm font-medium ${location.pathname === "/admin/report" ? "text-[#0D3778] font-semibold" : "text-slate-700"}`}>
									Reports
								</Link>
								<Link to="/admin/settings" className={`text-sm font-medium ${location.pathname === "/admin/settings" ? "text-[#0D3778] font-semibold" : "text-slate-700"}`}>
									Settings
								</Link>
								<div className="flex items-center gap-3 pt-2">
									<NotificationBell count={notifications} onClick={() => navigate('/notifications')} />
									<ProfileMenu
										user={user}
										roleLabel={roleLabel}
										onLogout={onLogout}
										avatarAfterName={false}
									/>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</header>
	);
}