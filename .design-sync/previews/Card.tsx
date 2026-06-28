import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
} from 'ziyafat-dls'

export function BookingCard() {
  return (
    <Card style={{ width: 340 }}>
      <CardHeader>
        <CardTitle>Wedding Reception</CardTitle>
        <CardDescription>Hussain Sagar Palace · 15 Jan 2025</CardDescription>
      </CardHeader>
      <CardContent>
        <p style={{ margin: 0 }}>
          250 guests · Full Hyderabadi menu with Biryani, Haleem &amp; Kebabs
        </p>
      </CardContent>
      <CardFooter style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Badge>Confirmed</Badge>
        <Button size="sm" variant="outline">View booking</Button>
      </CardFooter>
    </Card>
  )
}

export function StatCard() {
  return (
    <Card style={{ width: 260 }}>
      <CardHeader>
        <CardTitle>Monthly Revenue</CardTitle>
        <CardDescription>June 2025</CardDescription>
      </CardHeader>
      <CardContent>
        <p style={{ fontSize: 28, fontWeight: 700, margin: '4px 0 2px' }}>₹4,85,000</p>
        <p style={{ fontSize: 13, margin: 0, color: 'var(--color-on-surface-medium)' }}>
          +12% vs last month
        </p>
      </CardContent>
    </Card>
  )
}

export function SmallCard() {
  return (
    <Card size="sm" style={{ width: 260 }}>
      <CardHeader>
        <CardTitle>Upcoming Event</CardTitle>
      </CardHeader>
      <CardContent>
        <p style={{ margin: 0 }}>Birthday · 200 guests · 22 Jun 2025</p>
      </CardContent>
    </Card>
  )
}
