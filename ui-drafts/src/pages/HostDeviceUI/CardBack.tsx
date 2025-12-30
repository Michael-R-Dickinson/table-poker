const CardBack = () => {
  return (
    <div
      className="relative h-32 w-22 overflow-hidden rounded-lg border border-slate-200 p-1.5 shadow-lg"
      style={{
        backgroundColor: '#141820',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1), 4px 4px 0px 0px rgb(0 0 0 / 0.08)'
      }}
    >
      <div
        className="h-full w-full"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255, 255, 255, 0.15) 6px, rgba(255, 255, 255, 0.15) 8px)',
        }}
      />
    </div>
  )
}

export default CardBack
