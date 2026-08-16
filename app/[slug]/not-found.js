import Link from "next/link";
import { FaCube, FaHome } from "react-icons/fa";

export default function AppNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg text-center">
        {/* Glass card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-8 md:p-12 border border-white/40">
          <div className="flex justify-center mb-6">
            <div className="bg-linear3-to-br from-red-100 to-rose-200 p-5 rounded-full inline-flex">
              <FaCube className="text-5xl text-red-500" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Application Not Found
          </h1>

          <p className="text-gray-500 text-base md:text-lg mb-2">
            The application you are looking for
          </p>
          <p className="text-gray-500 text-base md:text-lg mb-8">
            does not exist or is no longer available.
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            <FaHome /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}