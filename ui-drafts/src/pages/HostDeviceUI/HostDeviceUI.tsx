import Card from "./Card"
import CardBack from "./CardBack"

const HostDeviceUI = () => {
  const potSize = 1250
  const currentBet = 30
  const mostRecentAction = "Michael + $15"
  const previousActions = [
    "Sarah + $10",
    "John calls"
  ]

  return (
    <div className="flex h-screen items-center justify-center p-4" style={{ backgroundColor: '#0C0D12' }}>
      <div className="flex flex-col items-center gap-6">
        {/* Top Info Row (Upside Down) */}
        <div className="relative flex w-full max-w-3xl rotate-180 items-start justify-between gap-4">
          {/* Total Pot - Left */}
          <div className="rounded-xl bg-black/30 px-4 py-2 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Pot
              </div>
              <div className="text-2xl font-bold text-white">
                ${potSize.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Most Recent Action - Center */}
          <div className="flex-1 pt-4">
            <div className="rounded-xl bg-black/30 px-6 py-2 backdrop-blur-sm">
              <div className="flex flex-col items-center">
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-300 mb-1">
                  Action
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="text-center text-2xl font-bold text-white">
                    {mostRecentAction}
                  </div>
                  {/* Previous Actions History */}
                  {previousActions.map((action, index) => {
                    const opacity = 80 - (index * 15)
                    const fontSize = index === 0 ? "text-lg" : index === 1 ? "text-base" : "text-sm"
                    return (
                      <div
                        key={index}
                        className={`text-center font-bold text-white ${fontSize}`}
                        style={{ opacity: `${opacity}%` }}
                      >
                        {action}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Current Bet - Right */}
          <div className="rounded-xl bg-black/30 px-4 py-2 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                To Call
              </div>
              <div className="text-2xl font-bold text-white">
                ${currentBet.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Community Cards */}
        <div className="flex gap-2">
          <Card suit="heart" value="A" />
          <Card suit="spade" value="K" />
          <Card suit="diamond" value="Q" />
          <CardBack />
          <CardBack />
        </div>

        {/* Bottom Info Row: Total Pot, Recent Action, Current Bet */}
        <div className="relative flex w-full max-w-3xl items-start justify-between gap-4">
          {/* Total Pot - Left */}
          <div className="rounded-xl bg-black/30 px-4 py-2 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Pot
              </div>
              <div className="text-2xl font-bold text-white">
                ${potSize.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Most Recent Action - Center */}
          <div className="flex-1 pt-4">
            <div className="rounded-xl bg-black/30 px-6 py-2 backdrop-blur-sm">
              <div className="flex flex-col items-center">
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-300 mb-1">
                  Action
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="text-center text-2xl font-bold text-white">
                    {mostRecentAction}
                  </div>
                  {/* Previous Actions History */}
                  {previousActions.map((action, index) => {
                    const opacity = 80 - (index * 15)
                    const fontSize = index === 0 ? "text-lg" : index === 1 ? "text-base" : "text-sm"
                    return (
                      <div
                        key={index}
                        className={`text-center font-bold text-white ${fontSize}`}
                        style={{ opacity: `${opacity}%` }}
                      >
                        {action}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Current Bet - Right */}
          <div className="rounded-xl bg-black/30 px-4 py-2 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                To Call
              </div>
              <div className="text-2xl font-bold text-white">
                ${currentBet.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HostDeviceUI
