import { Link } from "react-router-dom";
import logoWhite from "../assets/Rent My Car.png";

const SocialIcon = ({ children, href }) => (
	<a
		href={href}
		className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-slate-200 transition hover:bg-blue-600"
		target="_blank"
		rel="noreferrer"
	>
		{children}
	</a>
);

export default function Footer() {
	return (
		<footer className="bg-slate-900 text-slate-300">
			<div className="mx-auto max-w-6xl px-6 py-12">
				<div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5 lg:gap-x-20">
					<div className="space-y-4 lg:col-span-2">
						<div className="flex items-center gap-2 text-white">
							<img src={logoWhite} alt="Rent My Car" className="h-7 w-auto" />
							<span className="text-lg font-semibold">Rent My Car</span>
						</div>
						<p className="text-sm text-slate-400">
							Your trusted peer-to-peer vehicle rental platform. Connecting car
							owners with renters across Sri Lanka.
						</p>
						<div className="flex items-center gap-3">
							<SocialIcon href="https://facebook.com">
								<svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
									<path d="M13 9h3V6h-3c-2.2 0-4 1.8-4 4v2H6v3h3v6h3v-6h3l1-3h-4v-2c0-.6.4-1 1-1Z" />
								</svg>
							</SocialIcon>
							<SocialIcon href="https://twitter.com">
								<svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
									<path d="M19 7.1c.7-.4 1.2-1 1.5-1.7-.7.4-1.4.6-2.2.8-.6-.7-1.5-1-2.4-1-1.9 0-3.4 1.6-3.4 3.5 0 .3 0 .6.1.8-2.8-.2-5.2-1.5-6.8-3.6-.3.5-.4 1-.4 1.6 0 1.2.6 2.3 1.5 2.9-.5 0-1-.2-1.5-.4v.1c0 1.7 1.1 3.1 2.7 3.5-.3.1-.6.1-1 .1-.2 0-.4 0-.7-.1.4 1.4 1.8 2.4 3.4 2.4-1.3 1-2.9 1.6-4.6 1.6h-.9c1.7 1.1 3.7 1.7 5.9 1.7 7.1 0 10.9-6 10.9-11.1v-.5c.7-.5 1.2-1 1.6-1.6Z" />
								</svg>
							</SocialIcon>
							<SocialIcon href="https://instagram.com">
								<svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
									<path d="M12 7.3A4.7 4.7 0 1 0 16.7 12 4.7 4.7 0 0 0 12 7.3Zm0 7.7A3 3 0 1 1 15 12a3 3 0 0 1-3 3Zm6-7.9a1.1 1.1 0 1 1-1.1-1.1A1.1 1.1 0 0 1 18 7.1Zm2.9 1.1a6.5 6.5 0 0 0-1.8-4.6A6.5 6.5 0 0 0 14.5 1.8C12.9 1.7 11.1 1.7 9.5 1.8a6.5 6.5 0 0 0-4.6 1.8A6.5 6.5 0 0 0 3.1 8.2c-.1 1.6-.1 3.4 0 5a6.5 6.5 0 0 0 1.8 4.6 6.5 6.5 0 0 0 4.6 1.8c1.6.1 3.4.1 5 0a6.5 6.5 0 0 0 4.6-1.8 6.5 6.5 0 0 0 1.8-4.6c.1-1.6.1-3.4 0-5ZM19 19a4.4 4.4 0 0 1-2.5 2.5c-1.7.7-7.3.7-9 0A4.4 4.4 0 0 1 5 19a4.4 4.4 0 0 1-2.5-2.5c-.7-1.7-.7-7.3 0-9A4.4 4.4 0 0 1 5 5a4.4 4.4 0 0 1 2.5-2.5c1.7-.7 7.3-.7 9 0A4.4 4.4 0 0 1 19 5a4.4 4.4 0 0 1 2.5 2.5c.7 1.7.7 7.3 0 9Z" />
								</svg>
							</SocialIcon>
							<SocialIcon href="https://linkedin.com">
								<svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
									<path d="M6.4 9.4H3.1V21h3.3V9.4ZM4.8 3a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8ZM21 14.1c0-3.1-1.7-4.6-4-4.6a3.4 3.4 0 0 0-3 1.6V9.4h-3.2V21h3.2v-6.3c0-1.7.3-3.3 2.4-3.3s2.1 1.9 2.1 3.4V21H21Z" />
								</svg>
							</SocialIcon>
						</div>
					</div>

					<div>
						<h3 className="text-sm font-semibold uppercase tracking-wide text-white">
							Company
						</h3>
						<ul className="mt-4 space-y-2 text-sm">
							<li>
								<Link to="/about" className="hover:text-white">
									About Us
								</Link>
							</li>
							<li>
								<Link to="/how-it-works" className="hover:text-white">
									How It Works
								</Link>
							</li>
							<li>
								<Link to="/careers" className="hover:text-white">
									Careers
								</Link>
							</li>
							<li>
								<Link to="/press" className="hover:text-white">
									Press
								</Link>
							</li>
							<li>
								<Link to="/blog" className="hover:text-white">
									Blog
								</Link>
							</li>
						</ul>
					</div>

					<div>
						<h3 className="text-sm font-semibold uppercase tracking-wide text-white">
							Support
						</h3>
						<ul className="mt-4 space-y-2 text-sm">
							<li>
								<Link to="/help" className="hover:text-white">
									Help Center
								</Link>
							</li>
							<li>
								<Link to="/safety" className="hover:text-white">
									Safety
								</Link>
							</li>
							<li>
								<Link to="/cancellation" className="hover:text-white">
									Cancellation
								</Link>
							</li>
							<li>
								<Link to="/contact" className="hover:text-white">
									Contact Us
								</Link>
							</li>
							<li>
								<Link to="/faqs" className="hover:text-white">
									FAQs
								</Link>
							</li>
						</ul>
					</div>

					<div>
						<h3 className="text-sm font-semibold uppercase tracking-wide text-white">
							Legal
						</h3>
						<ul className="mt-4 space-y-2 text-sm">
							<li>
								<Link to="/terms" className="hover:text-white">
									Terms of Service
								</Link>
							</li>
							<li>
								<Link to="/privacy" className="hover:text-white">
									Privacy Policy
								</Link>
							</li>
							<li>
								<Link to="/cookies" className="hover:text-white">
									Cookie Policy
								</Link>
							</li>
							<li>
								<Link to="/rental-terms" className="hover:text-white">
									Rental Terms
								</Link>
							</li>
							<li>
								<Link to="/insurance" className="hover:text-white">
									Insurance
								</Link>
							</li>
						</ul>
					</div>
				</div>
			</div>
			<div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
				© 2026 Rent My Car. All rights reserved.
			</div>
		</footer>
	);
}
