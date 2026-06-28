# backend/tests/test_analytics.py
import pytest
from datetime import date
from httpx import AsyncClient

from models.user import User
from models.lead import Lead, LeadStatus
from models.booking import Booking, BookingStatus
from models.customer import Customer
from models.invoice import Invoice, InvoiceStatus
from tests.conftest import login_as


async def test_dashboard_requires_auth(client: AsyncClient):
    """Unauthenticated requests get 401."""
    response = await client.get("/api/v1/analytics/dashboard")
    assert response.status_code == 401


async def test_dashboard_empty_returns_valid_structure(client: AsyncClient, owner_user: User):
    """With no data, endpoint returns zeros and all status keys present."""
    await login_as(client, "owner@test.com", "Password123!")
    response = await client.get("/api/v1/analytics/dashboard")
    assert response.status_code == 200
    data = response.json()

    # All top-level keys present
    for key in ("kpis", "leads_by_status", "bookings_by_status", "events_by_status",
                "quotations_by_status", "invoices_by_status", "customers_by_type",
                "revenue_by_month"):
        assert key in data, f"Missing key: {key}"

    # KPIs default to zero
    kpis = data["kpis"]
    assert kpis["revenue_paid"] == 0.0
    assert kpis["revenue_outstanding"] == 0.0
    assert kpis["active_bookings"] == 0
    assert kpis["open_leads"] == 0
    assert kpis["lead_win_rate"] == 0.0
    assert kpis["events_this_month"] == 0

    # All statuses present (zero-filled)
    assert set(data["leads_by_status"].keys()) == {"new", "quoted", "negotiating", "won", "lost"}
    assert set(data["bookings_by_status"].keys()) == {"confirmed", "in_progress", "completed", "cancelled"}
    assert set(data["events_by_status"].keys()) == {
        "enquiry", "confirmed", "deposit_received", "event_day", "completed", "cancelled"
    }
    assert set(data["quotations_by_status"].keys()) == {"draft", "sent", "approved", "rejected", "superseded"}
    assert set(data["invoices_by_status"].keys()) == {"draft", "sent", "paid"}
    assert set(data["customers_by_type"].keys()) == {
        "individual", "corporate", "wedding_planner", "venue", "ngo"
    }

    # Revenue chart has 6 entries
    assert len(data["revenue_by_month"]) == 6
    for entry in data["revenue_by_month"]:
        assert "month" in entry
        assert "revenue" in entry


async def test_dashboard_kpis_with_data(client: AsyncClient, owner_user: User):
    """KPIs compute correctly from inserted records."""
    await login_as(client, "owner@test.com", "Password123!")

    customer = Customer(name="Test Customer", phone="9000000001")
    await customer.insert()

    # Active booking (confirmed)
    booking = Booking(customer=customer, title="Ali Wedding", status=BookingStatus.confirmed)
    await booking.insert()

    # Paid invoice: 50,000
    await Invoice(
        booking_id=booking,
        invoice_number="INV-001",
        status=InvoiceStatus.paid,
        total=50000.0,
        balance_due=0.0,
        payment_received_date=date(2026, 6, 1),
    ).insert()

    # Unpaid sent invoice: 20,000 outstanding
    await Invoice(
        booking_id=booking,
        invoice_number="INV-002",
        status=InvoiceStatus.sent,
        total=20000.0,
        balance_due=20000.0,
    ).insert()

    # Open lead
    await Lead(name="Open Lead", phone="9000000002", event_type="Wedding", status=LeadStatus.new).insert()

    response = await client.get("/api/v1/analytics/dashboard")
    assert response.status_code == 200
    data = response.json()

    assert data["kpis"]["revenue_paid"] == 50000.0
    assert data["kpis"]["revenue_outstanding"] == 20000.0
    assert data["kpis"]["active_bookings"] == 1
    assert data["kpis"]["open_leads"] == 1

    # Verify revenue appears in revenue_by_month
    june_entry = next((e for e in data["revenue_by_month"] if e["month"] == "Jun"), None)
    assert june_entry is not None, "June should be in revenue_by_month (current year range)"
    assert june_entry["revenue"] == 50000.0


async def test_dashboard_lead_win_rate(client: AsyncClient, owner_user: User):
    """Win rate = won / (won + lost) x 100, rounded to 1 decimal."""
    await login_as(client, "owner@test.com", "Password123!")

    await Lead(name="W1", phone="9000000001", event_type="Wedding", status=LeadStatus.won).insert()
    await Lead(name="W2", phone="9000000002", event_type="Wedding", status=LeadStatus.won).insert()
    await Lead(name="L1", phone="9000000003", event_type="Corp", status=LeadStatus.lost).insert()
    # Open lead should not affect win rate
    await Lead(name="N1", phone="9000000004", event_type="Birthday", status=LeadStatus.new).insert()

    response = await client.get("/api/v1/analytics/dashboard")
    assert response.status_code == 200
    data = response.json()
    # 2 won / 3 total decided = 66.7%
    assert data["kpis"]["lead_win_rate"] == pytest.approx(66.7, abs=0.1)


async def test_dashboard_status_counts(client: AsyncClient, owner_user: User):
    """Status distribution dicts count inserted records correctly."""
    await login_as(client, "owner@test.com", "Password123!")

    await Lead(name="A", phone="9000000001", event_type="Wedding", status=LeadStatus.new).insert()
    await Lead(name="B", phone="9000000002", event_type="Birthday", status=LeadStatus.new).insert()
    await Lead(name="C", phone="9000000003", event_type="Corp", status=LeadStatus.won).insert()

    response = await client.get("/api/v1/analytics/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert data["leads_by_status"]["new"] == 2
    assert data["leads_by_status"]["won"] == 1
    assert data["leads_by_status"]["lost"] == 0

    # All lead status keys must still be present (zero-filled)
    assert set(data["leads_by_status"].keys()) == {"new", "quoted", "negotiating", "won", "lost"}
