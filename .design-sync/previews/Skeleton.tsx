import { Skeleton } from 'ziyafat-dls'

export function Default() {
  return <Skeleton style={{ height: 20, width: 200 }} />
}

export function BookingCardSkeleton() {
  return (
    <div
      style={{
        width: 320,
        padding: 16,
        border: '1px solid var(--color-outline)',
        borderRadius: 12,
      }}
    >
      <Skeleton style={{ height: 18, width: '55%', marginBottom: 8 }} />
      <Skeleton style={{ height: 13, width: '40%', marginBottom: 20 }} />
      <Skeleton style={{ height: 13, width: '80%', marginBottom: 8 }} />
      <Skeleton style={{ height: 13, width: '65%', marginBottom: 8 }} />
      <Skeleton style={{ height: 13, width: '45%' }} />
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <div style={{ width: 400, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[80, 70, 65, 75, 60].map((w, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Skeleton style={{ height: 14, width: `${w}px` }} />
          <Skeleton style={{ height: 14, flex: 1 }} />
          <Skeleton style={{ height: 20, width: 60, borderRadius: 20 }} />
        </div>
      ))}
    </div>
  )
}
