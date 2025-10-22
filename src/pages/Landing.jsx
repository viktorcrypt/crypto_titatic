import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-sky-950 text-white text-center">
      <h1 className="text-4xl font-bold mb-4">🚢 Crypto Titanic</h1>
      <p className="mb-8 text-lg text-gray-300">
        The market is sinking… Who will you save?
      </p>
      <Link
        to="/app"
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl"
      >
        Enter App
      </Link>
    </div>
  );
}
