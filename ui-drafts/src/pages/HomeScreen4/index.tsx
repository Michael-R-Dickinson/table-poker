export default function HomeScreen4() {
  return (
    <div
      className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#050508] text-white"
      style={{
        background:
          "radial-gradient(circle at 50% 30%, #0e0f16 0%, #050508 70%)",
      }}
    >
      {/* Ambient purple glow - top */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
        style={{
          width: "500px",
          height: "500px",
          opacity: "0.4",
          background:
            "radial-gradient(circle at center, rgba(138, 130, 255, 0.2) 0%, rgba(90, 60, 255, 0.1) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Ambient purple glow - bottom */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: "400px",
          height: "300px",
          opacity: "0.3",
          background:
            "radial-gradient(ellipse at center, rgba(138, 130, 255, 0.15) 0%, transparent 60%)",
          filter: "blur(50px)",
        }}
      />

      {/* Main content container */}
      <div className="relative z-10 flex flex-col items-center px-6">
        {/* Title section with floating card aesthetic */}
        <div className="mb-16 text-center">
          {/* Small accent line above title */}
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-purple-500/50" />
            <div className="h-1 w-1 rounded-full bg-purple-400/60" />
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-purple-500/50" />
          </div>

          {/* Title */}
          <h1
            className="mb-2 text-6xl font-bold tracking-tight"
            style={{
              background:
                "linear-gradient(180deg, #ffffff 0%, #e0e0e0 70%, #b0b0b0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "0 0 40px rgba(138, 130, 255, 0.3)",
            }}
          >
            No-Chip Poker
          </h1>

          {/* Subtitle */}
          <p className="text-sm tracking-wide text-gray-400">
            Modern poker for home games
          </p>
        </div>

        {/* Buttons container */}
        <div className="flex w-full max-w-sm flex-col gap-4">
          {/* Host Game Button */}
          <button
            className="group relative overflow-hidden rounded-2xl px-8 py-5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background:
                "linear-gradient(135deg, rgba(138, 130, 255, 0.25) 0%, rgba(90, 60, 255, 0.2) 100%)",
              boxShadow: `
                0 0 0 1px rgba(138, 130, 255, 0.3),
                0 8px 32px -8px rgba(138, 130, 255, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.1)
              `,
            }}
          >
            {/* Button glow on hover */}
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(138, 130, 255, 0.3) 0%, transparent 70%)",
              }}
            />

            <div className="relative flex items-center justify-between">
              <span className="text-lg font-semibold tracking-wide">
                Host Game
              </span>
              <svg
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>
          </button>

          {/* Join Game Button */}
          <button
            className="group relative overflow-hidden rounded-2xl px-8 py-5 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "rgba(0, 0, 0, 0.3)",
              boxShadow: `
                0 0 0 1px rgba(255, 255, 255, 0.1),
                0 8px 32px -8px rgba(0, 0, 0, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.05)
              `,
            }}
          >
            {/* Button glow on hover */}
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(255, 255, 255, 0.05) 0%, transparent 70%)",
              }}
            />

            <div className="relative flex items-center justify-between">
              <span className="text-lg font-semibold tracking-wide">
                Join Game
              </span>
              <svg
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>
          </button>
        </div>

        {/* Bottom decorative element */}
        <div className="mt-16 flex items-center gap-2 opacity-40">
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
          <div className="flex gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-gray-600" />
            <div className="h-1.5 w-1.5 rounded-full bg-gray-600" />
            <div className="h-1.5 w-1.5 rounded-full bg-gray-600" />
          </div>
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
        </div>
      </div>

      {/* Floating decorative cards - subtle background elements */}
      <div
        className="pointer-events-none absolute left-[10%] top-[20%] h-20 w-14 rotate-[-15deg] rounded-lg opacity-[0.03]"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #cccccc 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute right-[15%] top-[25%] h-16 w-12 rotate-[20deg] rounded-lg opacity-[0.03]"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #cccccc 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-[25%] left-[15%] h-16 w-12 rotate-[10deg] rounded-lg opacity-[0.03]"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #cccccc 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-[30%] right-[10%] h-20 w-14 rotate-[-20deg] rounded-lg opacity-[0.03]"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #cccccc 100%)",
        }}
      />
    </div>
  );
}
