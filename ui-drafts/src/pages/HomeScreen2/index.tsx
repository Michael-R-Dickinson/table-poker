export default function HomeScreen2() {
  return (
    <div
      className="relative h-screen w-full overflow-hidden bg-[#050508] text-white flex items-center justify-center"
      style={{
        background:
          "radial-gradient(ellipse at center, #0e0f16 0%, #050508 70%)",
      }}
    >
      {/* Subtle purple glow in background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(138, 130, 255, 0.08) 0%, transparent 60%)",
        }}
      />

      {/* Decorative elements - top */}
      <div
        className="absolute top-0 left-0 w-96 h-96 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 0% 0%, rgba(90, 60, 255, 0.1) 0%, transparent 50%)",
        }}
      />

      {/* Decorative elements - bottom */}
      <div
        className="absolute bottom-0 right-0 w-96 h-96 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 100% 100%, rgba(138, 130, 255, 0.08) 0%, transparent 50%)",
        }}
      />

      {/* Main content card */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Title section */}
        <div className="text-center mb-12">
          <div className="mb-4">
            {/* Poker chip icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-600/20 backdrop-blur-sm border border-white/10 mb-6">
              <svg
                className="w-10 h-10 text-purple-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="6" />
                <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
                <path d="M6.34 6.34l1.42 1.42M16.24 16.24l1.42 1.42M6.34 17.66l1.42-1.42M16.24 7.76l1.42-1.42" />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-3 tracking-tight">
            No-Chip
            <br />
            Poker
          </h1>
          <p className="text-gray-400 text-sm tracking-wide">
            Play poker without the hassle of physical chips
          </p>
        </div>

        {/* Buttons container */}
        <div className="space-y-4">
          {/* Host Game button */}
          <button
            className="group relative w-full py-5 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background:
                "linear-gradient(135deg, rgba(138, 130, 255, 0.2) 0%, rgba(90, 60, 255, 0.15) 100%)",
              boxShadow:
                "0 0 0 1px rgba(138, 130, 255, 0.3), 0 8px 24px rgba(90, 60, 255, 0.2)",
            }}
          >
            {/* Hover glow effect */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(138, 130, 255, 0.15) 0%, transparent 70%)",
              }}
            />

            {/* Button content */}
            <div className="relative flex items-center justify-center gap-3">
              <svg
                className="w-6 h-6 text-purple-300"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 4v16m8-8H4" strokeLinecap="round" />
              </svg>
              <span className="text-lg font-semibold tracking-wide">
                Host Game
              </span>
            </div>
          </button>

          {/* Join Game button */}
          <button
            className="group relative w-full py-5 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              boxShadow:
                "0 0 0 1px rgba(255, 255, 255, 0.1), 0 4px 16px rgba(0, 0, 0, 0.3)",
            }}
          >
            {/* Hover glow effect */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(255, 255, 255, 0.08) 0%, transparent 70%)",
              }}
            />

            {/* Button content */}
            <div className="relative flex items-center justify-center gap-3">
              <svg
                className="w-6 h-6 text-gray-300"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  strokeLinecap="round"
                />
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-lg font-semibold tracking-wide">
                Join Game
              </span>
            </div>
          </button>
        </div>

        {/* Footer info */}
        <div className="text-center mt-12">
          <p className="text-xs text-gray-500 tracking-wide">
            Connect with friends and start playing
          </p>
        </div>
      </div>
    </div>
  );
}
