import React from 'react'
import {
  FaLinkedin,
  FaWhatsapp,
  FaYoutube,
  FaGithub,
  FaHashtag,
} from "react-icons/fa";

const End = () => {
  return (
    <>


  <section className="end flex flex-col justify-center items-center h-52 gap-8">
              <h2 className="text-xl font-bold">Keep In Touch</h2>
              <h3>Peshawar, Pakistan</h3>
              <h2 className="text-xl font-bold">m.yaseen.dev1@gmail.com</h2>
              <div className="icons flex gap-4">
                <li className="list-none">
                  <a href="https://www.linkedin.com/in/muhammad-yaseen-arman-webdeveloper?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app">
                    <FaLinkedin className="text-2xl" />
                  </a>
                </li>
                <li className="list-none">
                  <a href="https://wa.me/923245020658">
                    <FaWhatsapp className="text-2xl" />
                  </a>
                </li>
                <li className="list-none">
                  <a href="https://youtube.com/@pashto_devzone?si=KNUxsiikRH80tKPo">
                    <FaYoutube className="text-2xl" />
                  </a>
                </li>
                <li className="list-none">
                  <a href="https://github.com/pashto-devzone">
                    <FaGithub className="text-2xl" />
                  </a>
                </li>
                <li className="list-none">
                  <a href="https://pdz-blogs.hashnode.dev/">
                    <FaHashtag className="text-2xl" />
                  </a>
                </li>
              </div>
            </section>

      
    </>
  )
}

export default End
