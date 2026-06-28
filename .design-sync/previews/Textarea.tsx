import { Textarea } from 'ziyafat-dls'

export function Default() {
  return <Textarea placeholder="Add special requests or dietary notes…" style={{ maxWidth: 320 }} />
}

export function Filled() {
  return (
    <Textarea
      defaultValue="Biryani (vegetarian option available), Haleem, Kebabs. No peanut-based dishes — guest allergy noted."
      style={{ maxWidth: 360 }}
    />
  )
}

export function Disabled() {
  return (
    <Textarea placeholder="Event notes" disabled style={{ maxWidth: 320 }} />
  )
}
