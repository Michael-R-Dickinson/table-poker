export default function HomeScreen3() {
  return (
    <div
      className="relative h-screen w-full overflow-hidden bg-[#050508] text-white"
      style={{
        background:
          "radial-gradient(circle at 50% 0%, #0e0f16 0%, #050508 60%)",
      }}
    >
      {/* Purple ambient glow */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none"
        style={{
          width: "600px",
          height: "100%",
          opacity: "0.4",
          background:
            "radial-gradient(ellipse at center 20%, rgba(138, 130, 255, 0.2) 0%, rgba(90, 60, 255, 0.1) 40%, transparent 70%)",
        }}
      />

      {/* Decorative card suits background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
        <div className="absolute top-10 left-10 text-8xl">♠</div>
        <div className="absolute top-32 right-16 text-6xl">♥</div>
        <div className="absolute bottom-32 left-20 text-7xl">♣</div>
        <div className="absolute bottom-20 right-24 text-9xl">♦</div>
      </div>

      {/* Main content container */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
        {/* Title section */}
        <div className="mb-16 text-center">
          <h1 className="text-6xl font-bold mb-3 tracking-tight">
            No-Chip Poker
          </h1>
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-gray-600" />
            <span className="text-sm uppercase tracking-widest">
              Play anywhere
            </span>
            <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-gray-600" />
          </div>
        </div>

        {/* Buttons container with glass morphism */}
        <div className="w-full max-w-sm space-y-4">
          {/* Host Game Button */}
          <button
            className="group relative w-full overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background:
                "linear-gradient(135deg, rgba(138, 130, 255, 0.15) 0%, rgba(90, 60, 255, 0.15) 100%)",
              backdropFilter: "blur(10px)",
              boxShadow: `
                0 0 0 1px rgba(138, 130, 255, 0.2),
                0 8px 32px rgba(90, 60, 255, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.05)
              `,
            }}
          >
            <div className="px-8 py-6 flex items-center justify-between">
              <div className="text-left">
                <div className="text-2xl font-bold mb-1">Host Game</div>
                <div className="text-sm text-gray-400">Start a new table</div>
              </div>
              <div className="text-4xl opacity-50 group-hover:opacity-70 transition-opacity">
                ♠
              </div>
            </div>
            {/* Hover glow effect */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(138, 130, 255, 0.1) 0%, transparent 70%)",
              }}
            />
          </button>

          {/* Join Game Button */}
          <button
            className="group relative w-full overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
              backdropFilter: "blur(10px)",
              boxShadow: `
                0 0 0 1px rgba(255, 255, 255, 0.1),
                0 8px 32px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.05)
              `,
            }}
          >
            <div className="px-8 py-6 flex items-center justify-between">
              <div className="text-left">
                <div className="text-2xl font-bold mb-1">Join Game</div>
                <div className="text-sm text-gray-400">Enter a game code</div>
              </div>
              <div className="text-4xl opacity-50 group-hover:opacity-70 transition-opacity">
                ♦
              </div>
            </div>
            {/* Hover glow effect */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(255, 255, 255, 0.05) 0%, transparent 70%)",
              }}
            />
          </button>
        </div>

        {/* Bottom decorative element */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-20">
          <div className="w-2 h-2 rounded-full bg-white" />
          <div className="w-2 h-2 rounded-full bg-white/50" />
          <div className="w-2 h-2 rounded-full bg-white/50" />
        </div>
      </div>
    </div>
  );
}
