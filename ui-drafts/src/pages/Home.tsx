import { Link } from "wouter";

const Home = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="space-y-6 text-center">
        <h1 className="text-4xl font-bold">UI Drafts</h1>
        <div className="flex flex-col gap-3">
          <Link href="/design1">
            <a className="text-blue-500 hover:underline">Design 1</a>
          </Link>
          <Link href="/pulse">
            <a className="text-blue-500 hover:underline">
              Pulse - Personal Finance Tracker
            </a>
          </Link>
          <Link href="/mobile-poker">
            <a className="text-blue-500 hover:underline">Mobile Poker</a>
          </Link>
          <Link href="/playing-cards">
            <a className="text-blue-500 hover:underline">Playing Cards</a>
          </Link>
          <Link href="/host-device-ui">
            <a className="text-blue-500 hover:underline">Host Device UI</a>
          </Link>
          <hr className="my-4 border-gray-600" />
          <p className="text-sm text-gray-400 mb-2">
            No-Chip Poker Home Screens
          </p>
          <Link href="/home-screen-1">
            <a className="text-blue-500 hover:underline">Home Screen 1</a>
          </Link>
          <Link href="/home-screen-2">
            <a className="text-blue-500 hover:underline">Home Screen 2</a>
          </Link>
          <Link href="/home-screen-3">
            <a className="text-blue-500 hover:underline">Home Screen 3</a>
          </Link>
          <Link href="/home-screen-4">
            <a className="text-blue-500 hover:underline">Home Screen 4</a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
