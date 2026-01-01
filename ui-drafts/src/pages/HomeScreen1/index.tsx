export default function HomeScreen1() {
  return (
    <div
      className="relative h-screen w-full overflow-hidden bg-[#050508] text-white flex flex-col items-center justify-center"
      style={{
        background:
          "radial-gradient(circle at 50% 0%, #0e0f16 0%, #050508 60%)",
      }}
    >
      {/* Ambient purple glow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: "800px",
          height: "800px",
          opacity: "0.4",
          background:
            "radial-gradient(circle at center, rgba(138, 130, 255, 0.15) 0%, rgba(90, 60, 255, 0.08) 40%, transparent 70%)",
        }}
      />

      {/* Main content container */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 w-full max-w-md">
        {/* Logo/Title section with decorative elements */}
        <div className="mb-16 text-center">
          {/* Decorative chip icon */}
          <div className="mb-6 flex justify-center">
            <div
              className="relative w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(138, 130, 255, 0.2) 0%, rgba(90, 60, 255, 0.1) 100%)",
                boxShadow:
                  "0 0 30px rgba(138, 130, 255, 0.3), inset 0 0 20px rgba(138, 130, 255, 0.1)",
              }}
            >
              <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-purple-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path
                    fillRule="evenodd"
                    d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-bold tracking-tight mb-3">
            No-Chip Poker
          </h1>
          <p className="text-gray-400 text-sm tracking-wide">
            Host or join a game to get started
          </p>
        </div>

        {/* Button container */}
        <div className="w-full space-y-4">
          {/* Host Game Button */}
          <button
            className="relative w-full overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background:
                "linear-gradient(135deg, rgba(138, 130, 255, 0.15) 0%, rgba(90, 60, 255, 0.1) 100%)",
              boxShadow:
                "0 4px 20px rgba(138, 130, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            }}
          >
            {/* Glass morphism overlay */}
            <div
              className="absolute inset-0 bg-black/30"
              style={{ backdropFilter: "blur(10px)" }}
            />

            {/* Button content */}
            <div className="relative px-8 py-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-purple-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-xl font-semibold">Host Game</div>
                  <div className="text-xs text-gray-400">
                    Start a new poker game
                  </div>
                </div>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>

          {/* Join Game Button */}
          <button
            className="relative w-full overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
              boxShadow:
                "0 2px 10px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
            }}
          >
            {/* Glass morphism overlay */}
            <div
              className="absolute inset-0 bg-black/20"
              style={{ backdropFilter: "blur(10px)" }}
            />

            {/* Button content */}
            <div className="relative px-8 py-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-xl font-semibold">Join Game</div>
                  <div className="text-xs text-gray-400">Enter a game code</div>
                </div>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        </div>

        {/* Footer text */}
        <div className="mt-16 text-center">
          <p className="text-xs text-gray-500 tracking-wide">
            Play poker without physical chips
          </p>
        </div>
      </div>

      {/* Bottom accent glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: "100%",
          height: "200px",
          opacity: "0.2",
          background:
            "radial-gradient(ellipse at center bottom, rgba(138, 130, 255, 0.3) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
