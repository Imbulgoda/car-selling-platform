import React from "react";
import { MapPin, Mail, Phone, Headphones } from "lucide-react";
import bgImg from "../assets/ContactUsBG.jpeg";
import Layout from "../layouts/Layout";
import { Link } from "react-router-dom";

const ContactPage = () => {
  const contactCards = [
    {
      title: "Address",
      icon: <MapPin className="h-7 w-7 text-white" />,
      lines: ["612A, Galle Road, Panadura"],
    },
    {
      title: "Mail Us",
      icon: <Mail className="h-7 w-7 text-white" />,
      lines: ["dev.gamagerecruiters@gmail.com"],
    },
    {
      title: "Telephone",
      icon: <Phone className="h-7 w-7 text-white" />,
      lines: ["0773342567", "0777642250"],
    },
    {
      title: "Hotline",
      icon: <Headphones className="h-7 w-7 text-white" />,
      lines: ["0777315095", "0777443552"],
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* HERO */}
        <section className="relative h-screen w-full overflow-hidden">
          {/* Background image (replace with your own if needed) */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bgImg})` }}
          />

                    {/* Hero content */}
                    <div className="relative z-10 flex h-full items-center justify-center px-4 text-center">
                    <div>
                        <a href="#contact-section" className="hover:text-white no-underline">
                            <h1 className="text-4xl font-semibold tracking-wide text-white md:text-5xl">
                            Contact Us
                            </h1>
                        </a>
                        <p className="mt-4 text-lg text-white/80 md:text-xl">
                            <Link to="/" className="hover:text-white no-underline">
                                Home
                            </Link>
                            <span className="mx-2">/</span>

                <a href="/vehicles" className="hover:text-white no-underline">
                  Browse Cars
                </a>

                <span className="mx-2">/</span>

                <a
                  href="#contact-section"
                  className="hover:text-white no-underline"
                >
                  Contact
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* SECTION TITLE */}
        <section id="contact-section" className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-center text-2xl font-semibold text-slate-800">
            Contact Us
          </h2>

          {/* CARDS */}
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {contactCards.map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-[#0B3B8C]">
                  {c.icon}
                </div>

                <h3 className="mt-4 text-center text-lg font-semibold text-slate-800">
                  {c.title}
                </h3>

                <div className="mt-3 space-y-1 text-center text-sm text-slate-600">
                  {c.lines.map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ContactPage;
