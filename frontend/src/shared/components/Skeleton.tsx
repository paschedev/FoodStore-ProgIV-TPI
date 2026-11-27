type Props = {
  cantidad?: number
  alto?: string
  className?: string
}

function Skeleton({ cantidad = 6, alto = 'h-10', className = 'flex flex-col gap-3' }: Props) {
  return (
    <div className={className} aria-busy="true">
      {Array.from({ length: cantidad }, (_, i) => (
        <div key={i} className={`${alto} animate-pulse rounded-lg bg-slate-200`} />
      ))}
    </div>
  )
}

export default Skeleton
