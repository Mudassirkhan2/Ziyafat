import { Tabs, TabsList, TabsTrigger, TabsContent } from 'ziyafat-dls'

export function Default() {
  return (
    <Tabs defaultValue="details" style={{ width: 420 }}>
      <TabsList>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="menu">Menu</TabsTrigger>
        <TabsTrigger value="invoices">Invoices</TabsTrigger>
      </TabsList>
      <TabsContent value="details">
        <p style={{ padding: '12px 0', margin: 0 }}>
          Booking details — venue, date, guest count, and contact.
        </p>
      </TabsContent>
      <TabsContent value="menu">
        <p style={{ padding: '12px 0', margin: 0 }}>
          Biryani, Haleem, Mutton Korma, Kebabs, Sheer Khurma
        </p>
      </TabsContent>
      <TabsContent value="invoices">
        <p style={{ padding: '12px 0', margin: 0 }}>No invoices generated yet.</p>
      </TabsContent>
    </Tabs>
  )
}

export function LineVariant() {
  return (
    <Tabs defaultValue="active" style={{ width: 400 }}>
      <TabsList variant="line">
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
        <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
      </TabsList>
      <TabsContent value="active">
        <p style={{ padding: '12px 0', margin: 0 }}>3 active bookings</p>
      </TabsContent>
      <TabsContent value="completed">
        <p style={{ padding: '12px 0', margin: 0 }}>18 completed bookings</p>
      </TabsContent>
      <TabsContent value="cancelled">
        <p style={{ padding: '12px 0', margin: 0 }}>2 cancelled bookings</p>
      </TabsContent>
    </Tabs>
  )
}
