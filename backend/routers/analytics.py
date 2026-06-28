# backend/routers/analytics.py
import asyncio
import calendar
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from dependencies import get_current_user
from models.lead import Lead, LeadStatus
from models.booking import Booking, BookingStatus
from models.event import Event
from models.quotation import Quotation, QuotationStatus
from models.invoice import Invoice, InvoiceStatus
from models.customer import Customer
from models.enums import ContactType, EventStatus

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])


class KPIs(BaseModel):
    revenue_paid: float
    revenue_outstanding: float
    active_bookings: int
    open_leads: int
    lead_win_rate: float
    events_this_month: int


class RevenueMonth(BaseModel):
    month: str
    revenue: float


class QuotationMonth(BaseModel):
    month: str
    count: int


class DashboardData(BaseModel):
    kpis: KPIs
    leads_by_status: dict[str, int]
    bookings_by_status: dict[str, int]
    events_by_status: dict[str, int]
    quotations_by_status: dict[str, int]
    invoices_by_status: dict[str, int]
    customers_by_type: dict[str, int]
    revenue_by_month: list[RevenueMonth]
    quotations_by_month: list[QuotationMonth]


def _count_by(items: list, field: str) -> dict[str, int]:
    result: dict[str, int] = {}
    for item in items:
        val = getattr(item, field, None)
        if val is not None:
            key = val.value if hasattr(val, "value") else str(val)
            result[key] = result.get(key, 0) + 1
    return result


def _fill_statuses(counts: dict[str, int], enum_class) -> dict[str, int]:
    return {s.value: counts.get(s.value, 0) for s in enum_class}


@router.get("/dashboard", response_model=DashboardData)
async def get_dashboard(current_user=Depends(get_current_user)) -> DashboardData:
    now = datetime.now(timezone.utc)
    oid = current_user.org_id

    (
        all_leads,
        all_bookings,
        all_events,
        all_quotations,
        all_invoices,
        all_customers,
    ) = await asyncio.gather(
        Lead.find(Lead.org_id == oid).to_list(),
        Booking.find(Booking.org_id == oid).to_list(),
        Event.find(Event.org_id == oid).to_list(),
        Quotation.find(Quotation.org_id == oid).to_list(),
        Invoice.find(Invoice.org_id == oid).to_list(),
        Customer.find(Customer.org_id == oid).to_list(),
    )

    # KPIs
    paid_invoices = [inv for inv in all_invoices if inv.status == InvoiceStatus.paid]
    revenue_paid = round(sum(inv.total for inv in paid_invoices), 2)
    revenue_outstanding = round(
        sum(
            inv.balance_due for inv in all_invoices
            if inv.status == InvoiceStatus.sent and inv.balance_due > 0
        ),
        2,
    )
    active_bookings = sum(
        1 for b in all_bookings
        if b.status in (BookingStatus.confirmed, BookingStatus.in_progress)
    )
    open_leads = sum(
        1 for lead in all_leads
        if lead.status in (LeadStatus.new, LeadStatus.quoted, LeadStatus.negotiating)
    )
    won = sum(1 for l in all_leads if l.status == LeadStatus.won)
    lost = sum(1 for l in all_leads if l.status == LeadStatus.lost)
    lead_win_rate = round(won / (won + lost) * 100, 1) if (won + lost) > 0 else 0.0
    events_this_month = sum(
        1 for e in all_events
        if e.date and e.date.year == now.year and e.date.month == now.month
    )

    # Status distributions
    leads_by_status = _fill_statuses(_count_by(all_leads, "status"), LeadStatus)
    bookings_by_status = _fill_statuses(_count_by(all_bookings, "status"), BookingStatus)
    events_by_status = _fill_statuses(_count_by(all_events, "event_status"), EventStatus)
    quotations_by_status = _fill_statuses(_count_by(all_quotations, "status"), QuotationStatus)
    invoices_by_status = _fill_statuses(_count_by(all_invoices, "status"), InvoiceStatus)
    customers_by_type = _fill_statuses(_count_by(all_customers, "contact_type"), ContactType)

    # Revenue by month (last 6 months)
    # Build (year, month) window for last 6 months
    window: list[tuple[int, int]] = []
    yr, mo = now.year, now.month
    for _ in range(6):
        window.append((yr, mo))
        mo -= 1
        if mo == 0:
            mo = 12
            yr -= 1
    window.reverse()
    window_set = set(window)

    # Aggregate paid invoice revenue, gated to the window
    monthly: dict[tuple[int, int], float] = {}
    for inv in paid_invoices:
        if inv.payment_received_date:
            ym = (inv.payment_received_date.year, inv.payment_received_date.month)
            if ym in window_set:
                monthly[ym] = monthly.get(ym, 0.0) + inv.total

    revenue_by_month = [
        RevenueMonth(month=calendar.month_abbr[mo], revenue=round(monthly.get((yr, mo), 0.0), 2))
        for yr, mo in window
    ]

    # Quotations created per month (last 6 months, by created_at)
    monthly_quotations: dict[tuple[int, int], int] = {}
    for q in all_quotations:
        ym = (q.created_at.year, q.created_at.month)
        if ym in window_set:
            monthly_quotations[ym] = monthly_quotations.get(ym, 0) + 1

    quotations_by_month = [
        QuotationMonth(month=calendar.month_abbr[mo], count=monthly_quotations.get((yr, mo), 0))
        for yr, mo in window
    ]

    return DashboardData(
        kpis=KPIs(
            revenue_paid=revenue_paid,
            revenue_outstanding=revenue_outstanding,
            active_bookings=active_bookings,
            open_leads=open_leads,
            lead_win_rate=lead_win_rate,
            events_this_month=events_this_month,
        ),
        leads_by_status=leads_by_status,
        bookings_by_status=bookings_by_status,
        events_by_status=events_by_status,
        quotations_by_status=quotations_by_status,
        invoices_by_status=invoices_by_status,
        customers_by_type=customers_by_type,
        revenue_by_month=revenue_by_month,
        quotations_by_month=quotations_by_month,
    )
