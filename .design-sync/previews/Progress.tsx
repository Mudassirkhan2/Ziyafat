import { Progress, ProgressLabel, ProgressValue } from 'ziyafat-dls'

export function Default() {
  return <Progress value={65} style={{ width: 300 }} />
}

export function WithLabel() {
  return (
    <Progress value={40} style={{ width: 300 }}>
      <ProgressLabel>Booking completion</ProgressLabel>
      <ProgressValue />
    </Progress>
  )
}

export function MultipleStages() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 300 }}>
      <Progress value={100}>
        <ProgressLabel>Lead created</ProgressLabel>
        <ProgressValue />
      </Progress>
      <Progress value={100}>
        <ProgressLabel>Quotation sent</ProgressLabel>
        <ProgressValue />
      </Progress>
      <Progress value={60}>
        <ProgressLabel>Booking confirmed</ProgressLabel>
        <ProgressValue />
      </Progress>
      <Progress value={0}>
        <ProgressLabel>Invoice paid</ProgressLabel>
        <ProgressValue />
      </Progress>
    </div>
  )
}
