from datetime import date, datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from beanie import PydanticObjectId
from bson import DBRef, ObjectId
from models.booking import Booking
from models.event import Event
from models.quotation import Quotation, QuotationLineItem
from models.organisation import Organisation

router = APIRouter(prefix="/api/v1/portal", tags=["portal"])


class PortalOrg(BaseModel):
    name: str
    logo_url: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    tagline: Optional[str]
    primary: str
    on_primary: str
    secondary: str
    currency_code: str


class PortalEvent(BaseModel):
    id: str
    name: str
    date: str
    venue: Optional[str]
    guest_count: int
    ceremony_type: Optional[str]
    service_style: Optional[str]
    client_dietary_notes: Optional[str]


class PortalLineItem(BaseModel):
    dish_id: Optional[str]
    label: str
    qty_per_plate: float
    guest_count: int
    unit_price: float
    total: float


class PortalQuotation(BaseModel):
    id: str
    version: int
    status: str
    line_items: list[PortalLineItem]
    subtotal: float
    discount: float
    service_charge_percentage: float
    service_charge_amount: float
    tax_percentage: float
    tax_amount: float
    gratuity_percentage: float
    gratuity_amount: float
    delivery_fee: float
    setup_fee: float
    total: float
    deposit_percentage: Optional[float]
    deposit_amount: float
    deposit_due_date: Optional[date]
    final_balance_due_date: Optional[date]
    payment_terms_text: Optional[str]
    cancellation_policy_text: Optional[str]
    per_person_price: float
    client_signature_status: str
    signed_date: Optional[date]
    signed_at: Optional[datetime]
    signer_name: Optional[str]
    signature_image: Optional[str]


class PortalResponse(BaseModel):
    org: PortalOrg
    booking_title: str
    booking_status: str
    contract_signed: bool
    contract_signed_date: Optional[date]
    events: list[PortalEvent]
    quotation: Optional[PortalQuotation]


async def _resolve_booking(token: str) -> Booking:
    booking = await Booking.find_one(Booking.portal_token == token)
    if not booking:
        raise HTTPException(status_code=404, detail="Portal not found")
    return booking


async def _get_org(org_id) -> Organisation:
    org = await Organisation.get(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organisation not found")
    return org


@router.get("/{token}", response_model=PortalResponse)
async def get_portal(token: str):
    booking = await _resolve_booking(token)
    org = await _get_org(booking.org_id)

    booking_oid = ObjectId(str(booking.id))

    # Fetch all events for this booking
    events_raw = await Event.find(
        {"org_id": booking.org_id, "booking": DBRef("bookings", booking_oid)}
    ).to_list()

    # Latest quotation by version — DB-level filter avoids loading all org quotations
    quotations = await Quotation.find(
        {"org_id": booking.org_id, "booking_id": DBRef("bookings", booking_oid)}
    ).sort("-version").limit(1).to_list()
    quotation = quotations[0] if quotations else None

    portal_events = [
        PortalEvent(
            id=str(e.id),
            name=e.name,
            date=str(e.date),
            venue=e.venue,
            guest_count=e.guest_count,
            ceremony_type=e.ceremony_type.value if e.ceremony_type else None,
            service_style=e.service_style.value if e.service_style else None,
            client_dietary_notes=e.client_dietary_notes,
        )
        for e in events_raw
    ]

    portal_quotation = None
    if quotation:
        portal_quotation = PortalQuotation(
            id=str(quotation.id),
            version=quotation.version,
            status=quotation.status.value,
            line_items=[
                PortalLineItem(
                    dish_id=str(item.dish_id) if item.dish_id else None,
                    label=item.label,
                    qty_per_plate=item.qty_per_plate,
                    guest_count=item.guest_count,
                    unit_price=item.unit_price,
                    total=item.total,
                )
                for item in quotation.line_items
            ],
            subtotal=quotation.subtotal,
            discount=quotation.discount,
            service_charge_percentage=quotation.service_charge_percentage,
            service_charge_amount=quotation.service_charge_amount,
            tax_percentage=quotation.tax_percentage,
            tax_amount=quotation.tax_amount,
            gratuity_percentage=quotation.gratuity_percentage,
            gratuity_amount=quotation.gratuity_amount,
            delivery_fee=quotation.delivery_fee,
            setup_fee=quotation.setup_fee,
            total=quotation.total,
            deposit_percentage=quotation.deposit_percentage,
            deposit_amount=quotation.deposit_amount,
            deposit_due_date=quotation.deposit_due_date,
            final_balance_due_date=quotation.final_balance_due_date,
            payment_terms_text=quotation.payment_terms_text,
            cancellation_policy_text=quotation.cancellation_policy_text,
            per_person_price=quotation.per_person_price,
            client_signature_status=quotation.client_signature_status,
            signed_date=quotation.signed_date,
            signed_at=quotation.signed_at,
            signer_name=quotation.signer_name,
            signature_image=quotation.signature_image,
        )

    return PortalResponse(
        org=PortalOrg(
            name=org.name,
            logo_url=org.logo_url,
            phone=org.phone,
            email=org.email,
            tagline=org.tagline,
            primary=org.primary,
            on_primary=org.on_primary,
            secondary=org.secondary,
            currency_code=org.currency_code,
        ),
        booking_title=booking.title,
        booking_status=booking.status.value,
        contract_signed=booking.contract_signed,
        contract_signed_date=booking.contract_signed_date,
        events=portal_events,
        quotation=portal_quotation,
    )


# ---------------------------------------------------------------------------
# POST /api/v1/portal/{token}/sign
# ---------------------------------------------------------------------------

class SignBody(BaseModel):
    signer_name: str
    signature_image: Optional[str] = None


class SignResponse(BaseModel):
    client_signature_status: str
    signed_date: Optional[date]
    signed_at: Optional[datetime]
    signer_name: Optional[str]


@router.post("/{token}/sign", response_model=SignResponse)
async def sign_quotation(token: str, body: SignBody, request: Request):
    booking = await _resolve_booking(token)

    quotations = await Quotation.find(
        {"org_id": booking.org_id, "booking_id": DBRef("bookings", PydanticObjectId(str(booking.id)))}
    ).sort("-version").limit(1).to_list()

    if not quotations:
        raise HTTPException(status_code=404, detail="No quotation found for this booking")

    quotation = quotations[0]

    if quotation.client_signature_status == "signed":
        raise HTTPException(status_code=409, detail="Quotation already signed")

    now = datetime.now(timezone.utc)
    quotation.client_signature_status = "signed"
    quotation.signed_date = date.today()
    quotation.signed_at = now
    quotation.signer_name = body.signer_name
    quotation.signer_ip = request.client.host if request.client else None
    quotation.signature_image = body.signature_image
    quotation.updated_at = now
    await quotation.save()

    return SignResponse(
        client_signature_status=quotation.client_signature_status,
        signed_date=quotation.signed_date,
        signed_at=quotation.signed_at,
        signer_name=quotation.signer_name,
    )


# ---------------------------------------------------------------------------
# POST /api/v1/portal/{token}/dietary
# ---------------------------------------------------------------------------

class DietaryBody(BaseModel):
    event_id: str
    notes: str


class DietaryResponse(BaseModel):
    event_id: str
    client_dietary_notes: str


@router.post("/{token}/dietary", response_model=DietaryResponse)
async def submit_dietary(token: str, body: DietaryBody):
    booking = await _resolve_booking(token)

    # Fetch event and verify it belongs to this booking
    try:
        event = await Event.get(body.event_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Event not found")

    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")

    # Check the event's booking reference points to our booking
    booking_ref = event.booking
    if hasattr(booking_ref, "ref"):
        event_booking_id = str(booking_ref.ref.id)
    else:
        event_booking_id = str(booking_ref.id)

    if event_booking_id != str(booking.id):
        raise HTTPException(status_code=404, detail="Event not found")

    event.client_dietary_notes = body.notes
    event.updated_at = datetime.now(timezone.utc)
    await event.save()

    return DietaryResponse(event_id=str(event.id), client_dietary_notes=event.client_dietary_notes)
