import React from "react";
import Navbar from "../components/Navbar";
import {
  FaEnvelope,
  FaPhone,
  FaLinkedin,
  FaGithub,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
  FaHashtag,
} from "react-icons/fa";
import Entrance from "../components/Entrance";
import End from "../components/End";

export const metadata = {
  title: "Contact | Pashto DevZone",
  description:
    "Contact Pashto DevZone for web development, software applications, licenses, and project inquiries.",
  keywords: ["contact", "web developer", "Pashto DevZone", "WhatsApp", "email"],
};

const page = () => {
  return (
    <>
      <div className="bg-white md:max-w-6xl md:mx-auto sm:rounded-lg p-2 md:shadow-2xl min-h-screen w-screen md:mt-17.5 mb-24 text-gray-700">
        <Navbar />
        <div className="flex">
          <div className="left hidden md:block min-h-screen md:w-[15%] items-center justify-center">
            <div className="h-[80vh] flex items-center justify-start pl-0.5">
              <ul className="social flex flex-col gap-5.5">
<li>
                  <a
                    target="_blank" rel="noopener noreferrer" href="https://github.com/pashto-devzone"
                  >
                    <FaGithub className="text-2xl ml-14" />
                  </a>
                </li>
                <li>
                  <a
                    target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/in/muhammad-yaseen-arman-webdeveloper?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                  >
                    <FaLinkedin className="text-2xl ml-14" />
                  </a>
                </li>
                <li>
                  <a
                    target="_blank" rel="noopener noreferrer" href="https://www.tiktok.com/@pashto_devzone"
                  >
                    <FaTiktok className="text-2xl ml-14" />
                  </a>
                </li>
                <li>
                  <a
                    target="_blank" rel="noopener noreferrer" href="https://youtube.com/@pashto_devzone?si=KNUxsiikRH80tKPo"
                  >
                    <FaYoutube className="text-2xl ml-14" />
                  </a>
                </li>
                <li>
                  <a target="_blank" rel="noopener noreferrer" href="https://wa.me/923245020658">
                    <FaWhatsapp className="text-2xl ml-14" />
                  </a>
                </li>
                <li>
                  <a target="_blank" rel="noopener noreferrer" href="https://pdz-blogs.hashnode.dev/">
                    <FaHashtag className="text-2xl ml-14" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <Entrance
            className="public-main-content w-[98%] md:w-[85%] felx items-center justify-center mb-8 mx-4 md:mr-12"
          >
            <div className="w-full bg-[#F6F6F7] p-8 md:p-12 rounded-xl">
              {/* HEADER */}
              <div className="flex flex-col gap-3 mb-8">
                <h2 className="text-2xl md:text-3xl font-semibold text-black">
                  Let’s Work Together
                </h2>

                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-800"></div>
                  <div className="h-1 w-32 bg-red-800"></div>
                </div>

                <p className="text-sm md:text-base text-black opacity-70">
                  Got an idea or need a website for your business? Let’s build
                  something meaningful together — contact me and get started.
                </p>
              </div>

              {/* MAIN GRID — compact & balanced */}
              <div className="grid md:grid-cols-2 gap-5 items-stretch">
                {/* LEFT - WHATSAPP PRIMARY CARD */}
                <a
                  target="_blank" rel="noopener noreferrer" href="https://wa.me/923245020658"
                  className="bg-green-500 text-white rounded-xl p-5 flex flex-col gap-4 hover:scale-[1.02] transition-all duration-300 shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <FaWhatsapp className="text-2xl" />
                    <h3 className="text-lg md:text-xl font-semibold">
                      WhatsApp
                    </h3>
                  </div>
                  <p className="text-sm opacity-90 leading-relaxed">
                    Fastest way to reach me. Usually replies within minutes.
                  </p>
                  <div className="flex items-center justify-between gap-3 mt-auto">
                    <span className="text-sm font-medium">03245020658</span>
                    <span className="bg-white text-green-600 font-medium py-1.5 px-4 rounded-lg whitespace-nowrap">
                      Chat Now →
                    </span>
                  </div>
                </a>

                {/* RIGHT - CONTACT BOX */}
                <div className="bg-white rounded-xl p-5 flex flex-col justify-between shadow-sm gap-4">
                  <div className="space-y-2.5">
                    {/* EMAIL */}
                    <a
                      target="_blank" rel="noopener noreferrer" href="mailto:m.yaseen.dev1@gmail.com"
                      className="flex items-center gap-3 group"
                    >
                      <FaEnvelope className="text-lg text-black group-hover:text-red-500 transition shrink-0" />
                      <span className="text-sm group-hover:text-red-500 transition break-all">
                        m.yaseen.dev1@gmail.com
                      </span>
                    </a>

                    {/* SECONDARY WHATSAPP */}
                    <a
                      target="_blank" rel="noopener noreferrer" href="https://wa.me/923078527457"
                      className="flex items-center gap-3 group"
                    >
                      <FaWhatsapp className="text-lg text-black group-hover:text-green-500 transition shrink-0" />
                      <span className="text-sm group-hover:text-green-500 transition">
                        WhatsApp: 03078527457
                      </span>
                    </a>

                    {/* PHONE */}
                    <a
                      target="_blank" rel="noopener noreferrer" href="tel:+923245020658"
                      className="flex items-center gap-3 group"
                    >
                      <FaPhone className="text-lg text-black group-hover:text-blue-500 transition shrink-0" />
                      <span className="text-sm group-hover:text-blue-500 transition">
                        Call: 03245020658
                      </span>
                    </a>

                    {/* ALT EMAIL (secondary) */}
                    <a
                      target="_blank" rel="noopener noreferrer" href="mailto:armandevelopers1298@gmail.com"
                      className="flex items-center gap-3 group"
                    >
                      <FaEnvelope className="text-lg text-black group-hover:text-red-500 transition shrink-0" />
                      <span className="text-sm group-hover:text-red-500 transition break-all">
                        Alt Email: armandevelopers1298@gmail.com
                      </span>
                    </a>
                  </div>

                  {/* SOCIAL */}
                  <div className="flex gap-5 text-xl pt-3 flex-wrap border-t border-gray-100">
                    <a
                      target="_blank" rel="noopener noreferrer" href="https://github.com/pashto-devzone"
                      aria-label="GitHub"
                      className="text-black hover:scale-125 transition"
                    >
                      <FaGithub />
                    </a>

                    <a
                      href="https://www.linkedin.com/in/muhammad-yaseen-arman-webdeveloper?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                      target="_blank"
                      aria-label="LinkedIn"
                      className="text-black hover:text-blue-600 hover:scale-125 transition"
                    >
                      <FaLinkedin />
                    </a>

                    <a
                      target="_blank" rel="noopener noreferrer" href="https://wa.me/923245020658"
                      aria-label="WhatsApp"
                      className="text-black hover:text-green-500 hover:scale-125 transition"
                    >
                      <FaWhatsapp />
                    </a>

                    <a
                      target="_blank" rel="noopener noreferrer" href="https://pdz-blogs.hashnode.dev/"
                      aria-label="Hashnode"
                      className="text-black hover:text-blue-600 hover:scale-125 transition"
                    >
                      <FaHashtag />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Entrance>
        </div>
        <End />
      </div>
    </>
  );
};

export default page;

