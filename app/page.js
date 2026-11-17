import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Skills from "./components/Skills";
import Resume from "./components/Resume";
import Work from "./components/Work";
// import SoftwareSection from "./components/app/SoftwareSection";
import {
  FaLinkedin,
  FaGithub,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
  FaHashtag,
} from "react-icons/fa";
import End from "./components/End";

export const metadata = {
  title: "Pashto DevZone | Web Developer & Software Applications",
  description:
    "Pashto DevZone is the portfolio of a professional web developer creating modern web apps, Next.js sites, and software products.",
  keywords: [
    "Pashto DevZone",
    "web developer",
    "software developer",
    "Next.js",
    "React",
    "JavaScript",
    "MERN stack",
    "portfolio",
    "software applications",
  ],
};

export default function Home() {
  return (
    <>
      <div className="bg-white md:max-w-6xl md:mx-auto sm:rounded-lg p-2 md:shadow-2xl min-h-screen w-screen md:mt-17.5 mb-24 text-gray-700">
        <Navbar />
        <div className="flex">
          <div className="left hidden md:block min-h-screen  md:w-[15%] items-center justify-center">
            <div className="h-[80vh] flex items-center justify-start pl-0.5">
              <ul className="social flex flex-col gap-5.5">
                <li>
                  <a target="_blank" rel="noopener noreferrer" href="https://github.com/pashto-devzone">
                    <FaGithub className="text-2xl ml-14" />
                  </a>
                </li>
                <li>
                  <a target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/in/muhammad-yaseen-arman-webdeveloper?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app">
                    <FaLinkedin className="text-2xl ml-14" />
                  </a>
                </li>
                <li>
                  <a target="_blank" rel="noopener noreferrer" href="https://www.tiktok.com/@pashto_devzone">
                    <FaTiktok className="text-2xl ml-14" />
                  </a>
                </li>
                <li>
                  <a target="_blank" rel="noopener noreferrer" href="https://youtube.com/@pashto_devzone?si=KNUxsiikRH80tKPo">
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

          <main className="public-main-content animate-fadeUp w-[98%] md:w-[85%] flex flex-col items-center justify-center">

            <Hero/>


            <Skills/>


            <Resume/>


            <Work/>

            {/* <SoftwareSection /> */}

          
            <End/>
          </main>
        </div>
      </div>
    </>
  );
}
