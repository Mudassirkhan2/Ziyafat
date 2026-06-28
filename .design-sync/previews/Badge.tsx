import { Badge } from 'ziyafat-dls'

export function Default() {
  return <Badge>Confirmed</Badge>
}

export function Variants() {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge>Active</Badge>
      <Badge variant="secondary">Pending</Badge>
      <Badge variant="outline">Draft</Badge>
      <Badge variant="destructive">Cancelled</Badge>
      <Badge variant="ghost">Archived</Badge>
    </div>
  )
}

export function StatusExamples() {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      <Badge>Confirmed</Badge>
      <Badge variant="secondary">In Progress</Badge>
      <Badge variant="outline">Quote Sent</Badge>
      <Badge variant="destructive">Overdue</Badge>
    </div>
  )
}
