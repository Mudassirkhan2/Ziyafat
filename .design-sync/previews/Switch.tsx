import { Switch } from 'ziyafat-dls'

export function Default() {
  return <Switch defaultChecked />
}

export function States() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <Switch defaultChecked />
        <span style={{ fontSize: 14 }}>Send booking confirmation email</span>
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <Switch />
        <span style={{ fontSize: 14 }}>Auto-generate invoice on confirm</span>
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Switch disabled />
        <span style={{ fontSize: 14, opacity: 0.5 }}>WhatsApp alerts (unavailable)</span>
      </label>
    </div>
  )
}

export function Sizes() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Switch size="sm" defaultChecked />
      <Switch defaultChecked />
    </div>
  )
}
