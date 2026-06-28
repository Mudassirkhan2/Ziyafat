import { Button } from 'ziyafat-dls'

export function Default() {
  return <Button>Create Booking</Button>
}

export function Variants() {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Button variant="default">Confirm</Button>
      <Button variant="outline">Edit</Button>
      <Button variant="secondary">Save Draft</Button>
      <Button variant="ghost">Cancel</Button>
      <Button variant="destructive">Delete</Button>
    </div>
  )
}

export function Sizes() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button>Default</Button>
      <Button size="lg">Large</Button>
    </div>
  )
}

export function Disabled() {
  return <Button disabled>Processing…</Button>
}
