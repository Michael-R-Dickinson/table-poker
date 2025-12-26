import { useState } from "react"

import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: App,
})

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="flex items-center justify-center gap-x-6"></div>
      <h1 className="text-3xl text-amber-200">React Tanning 🌴</h1>
      <p className="font-bold mt-2">
        React + Vite + TypeScript + TanStack + Tailwind
      </p>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)} className="mb-6">
          count is {count}
        </button>
        <p>
          Edit <code>src/routes/index.lazy.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
