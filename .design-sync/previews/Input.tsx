import { Input } from 'ziyafat-dls'

export function Default() {
  return <Input placeholder="Event name" style={{ maxWidth: 280 }} />
}

export function Filled() {
  return <Input defaultValue="Wedding — Hussain Sagar Palace" style={{ maxWidth: 320 }} />
}

export function Disabled() {
  return <Input placeholder="Booking ID (auto-generated)" disabled style={{ maxWidth: 280 }} />
}
