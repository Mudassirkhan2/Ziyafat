"""
Seed script — populates all collections with realistic dummy data.

Usage (from backend/ directory with venv active):
    python migrations/seed.py            # seed only (skips if data exists)
    python migrations/seed.py --clear    # drop all docs, then seed fresh
    python migrations/seed.py --help

Dependency insertion order:
  Organisation → Users → Ingredients → Dishes
  → Leads → Customers → Bookings → Events
  → Quotations → Invoices
"""

import asyncio
import sys
from datetime import date, timedelta, datetime, timezone
from beanie import PydanticObjectId

# ── Bootstrap path so we can import from backend root ──
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import init_db, close_db
from core.security import hash_password

from models.organisation import Organisation, ReportHeaderConfig, StorefrontSection
from models.user import User, UserRole
from models.ingredient import Ingredient
from models.enums import (
    IngredientCategory, DishCourse, CuisineType,
    CeremonyType, ServiceStyle, FoodPreference,
    ContactType, EventStatus,
)
from models.dish import Dish, RecipeIngredient
from models.lead import Lead, LeadStatus
from models.customer import Customer
from models.booking import Booking, BookingStatus
from models.event import Event, CateringModel
from models.quotation import Quotation, QuotationStatus, QuotationLineItem
from models.invoice import Invoice, InvoiceStatus


# ─────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────

def today(offset_days: int = 0) -> date:
    return date.today() + timedelta(days=offset_days)


def make_line_items(dish_ids: list[PydanticObjectId], guest_count: int) -> list[QuotationLineItem]:
    """Build QuotationLineItem list from a handful of dish IDs."""
    labels = ["Seekh Kebab", "Butter Chicken", "Dal Makhani", "Shahi Paneer", "Gulab Jamun"]
    prices = [120.0, 180.0, 90.0, 150.0, 60.0]
    items = []
    for i, dish_id in enumerate(dish_ids[:5]):
        label = labels[i] if i < len(labels) else f"Dish {i+1}"
        price = prices[i] if i < len(prices) else 100.0
        total = price * guest_count
        items.append(QuotationLineItem(
            dish_id=dish_id,
            label=label,
            qty_per_plate=1.0,
            guest_count=guest_count,
            unit_price=price,
            total=total,
        ))
    return items


def calc_totals(items: list[QuotationLineItem], discount: float = 0.0,
                svc_pct: float = 5.0, tax_pct: float = 0.0) -> dict:
    subtotal = sum(i.total for i in items)
    svc = round(subtotal * svc_pct / 100, 2)
    tax = round(subtotal * tax_pct / 100, 2)
    total = round(subtotal - discount + svc + tax, 2)
    return dict(
        subtotal=subtotal,
        discount=discount,
        service_charge_percentage=svc_pct,
        service_charge_amount=svc,
        tax_percentage=tax_pct,
        tax_amount=tax,
        total=total,
        per_person_price=round(total / max(items[0].guest_count, 1), 2) if items else 0.0,
    )


# ─────────────────────────────────────────────────────────
# Seeders — one function per collection
# ─────────────────────────────────────────────────────────

async def seed_organisation() -> Organisation:
    org = Organisation(
        name="Al-Baraka Catering Co.",
        slug="al-baraka",
        logo_url=None,
        address="12, Food Street, Jubilee Hills, Hyderabad – 500033",
        phone="+91-9876543210",
        email="info@albaraka.in",
        tagline="Every bite tells a story",
        primary="#d97706",
        on_primary="#ffffff",
        primary_container="#451a03",
        on_primary_container="#fed7aa",
        secondary="#f59e0b",
        on_secondary="#0c0a09",
        secondary_container="#78350f",
        on_secondary_container="#fde68a",
        report_header=ReportHeaderConfig(
            logo_alignment="left",
            show_address=True,
            show_phone=True,
            show_email=True,
            show_tagline=True,
        ),
        storefront_sections=[
            StorefrontSection(type="hero",      enabled=True,  order=0),
            StorefrontSection(type="dish_grid", enabled=True,  order=1),
            StorefrontSection(type="about",     enabled=True,  order=2),
            StorefrontSection(type="contact",   enabled=True,  order=3),
        ],
        bank_account_name="Al-Baraka Catering Co.",
        bank_account_number="123456789012",
        bank_ifsc="HDFC0001234",
        bank_name="HDFC Bank",
        default_service_charge_percentage=5.0,
        default_tax_rate=0.0,
        default_payment_terms="50% advance, balance on event day.",
        default_cancellation_policy="Cancellations within 7 days forfeit the deposit.",
        invoice_prefix="ZYF",
        social_links={
            "instagram": "https://instagram.com/albarakacatering",
            "facebook": "https://facebook.com/albarakacatering",
        },
        setup_completed=True,
    )
    await org.insert()
    print(f"  ✓ Organisation  : {org.name}  [{org.id}]")
    return org


async def seed_users(org: Organisation) -> list[User]:
    users_data = [
        dict(name="Mudassir Khan",  email="mudassir@albaraka.in",  role=UserRole.owner,   password="Password@1234"),
         dict(name="Guest Login",  email="guest@albaraka.in",  role=UserRole.owner,   password="Password@1234"),
    ]
    users = []
    for d in users_data:
        u = User(
            org_id=org.id,
            name=d["name"],
            email=d["email"],
            hashed_password=hash_password(d["password"]),
            role=d["role"],
            is_active=True,
        )
        await u.insert()
        users.append(u)
        print(f"  ✓ User          : {u.name} ({u.role})  pw={d['password']}")
    return users


async def seed_ingredients(org: Organisation) -> list[Ingredient]:
    rows = [
        # name, unit, cost, supplier, category, stock
        ("Basmati Rice",       "kg",  85.0,  "Dawat Foods",        IngredientCategory.dry_goods, 50.0),
        ("Chicken (whole)",    "kg", 220.0,  "Fresh Farms",        IngredientCategory.protein,   30.0),
        ("Mutton",             "kg", 620.0,  "Halal Butchers",     IngredientCategory.protein,   15.0),
        ("Paneer",             "kg", 300.0,  "Mother Dairy",       IngredientCategory.dairy,     10.0),
        ("Garam Masala",       "g",    1.2,  "MDH Spices",         IngredientCategory.spices,   500.0),
        ("Biryani Masala",     "g",    0.9,  "MDH Spices",         IngredientCategory.spices,   800.0),
        ("Tomatoes",           "kg",   35.0, "Local Market",       IngredientCategory.produce,   20.0),
        ("Onions",             "kg",   25.0, "Local Market",       IngredientCategory.produce,   40.0),
        ("Refined Oil",        "L",   160.0, "Fortune Foods",      IngredientCategory.oils,      30.0),
        ("Milk",               "L",    65.0, "Amul",               IngredientCategory.dairy,     15.0),
        ("Cashews",            "kg",  900.0, "Dry Fruits Hub",     IngredientCategory.dry_goods,  5.0),
        ("Cream",              "L",   200.0, "Amul",               IngredientCategory.dairy,     10.0),
        ("Saffron",            "g",    12.0, "Kashmir Bazaar",     IngredientCategory.spices,   100.0),
        ("Green Cardamom",     "g",     2.5, "MDH Spices",         IngredientCategory.spices,   200.0),
        ("Sugar",              "kg",    45.0, "Local Market",      IngredientCategory.dry_goods, 20.0),
    ]
    ingredients = []
    for name, unit, cost, supplier, cat, stock in rows:
        ing = Ingredient(
            org_id=org.id,
            name=name,
            base_unit=unit,
            cost_per_unit=cost,
            supplier=supplier,
            stock_on_hand=stock,
            reorder_threshold=stock * 0.2,
            category=cat,
            yield_percentage=95.0,
            is_active=True,
        )
        await ing.insert()
        ingredients.append(ing)
    print(f"  ✓ Ingredients   : {len(ingredients)} inserted")
    return ingredients


async def seed_dishes(org: Organisation, ingredients: list[Ingredient]) -> list[Dish]:
    # Helper: build RecipeIngredient by ingredient index
    def ri(idx: int, qty: float, unit: str) -> RecipeIngredient:
        return RecipeIngredient(
            ingredient_id=ingredients[idx].id,
            quantity_per_100_guests=qty,
            unit=unit,
        )

    rows = [
        dict(
            name="Chicken Biryani",
            category="Rice",
            description="Slow-cooked aromatic rice layered with spiced chicken.",
            per_plate_cost=120.0, selling_price=250.0, is_veg=False,
            course=DishCourse.main, cuisine_type=CuisineType.hyderabadi,
            dietary_tags=["halal"], tags=["signature", "bestseller"],
            preparation_time_minutes=90,
            recipe_ingredients=[ri(0,8,"kg"), ri(1,7,"kg"), ri(4,200,"g"), ri(5,300,"g"), ri(12,5,"g")],
        ),
        dict(
            name="Mutton Dum Biryani",
            category="Rice",
            description="Royal Hyderabadi dum biryani with tender mutton.",
            per_plate_cost=200.0, selling_price=380.0, is_veg=False,
            course=DishCourse.main, cuisine_type=CuisineType.hyderabadi,
            dietary_tags=["halal"], tags=["premium", "bestseller"],
            preparation_time_minutes=120,
            recipe_ingredients=[ri(0,8,"kg"), ri(2,6,"kg"), ri(4,200,"g"), ri(12,5,"g"), ri(13,100,"g")],
        ),
        dict(
            name="Paneer Butter Masala",
            category="Curry",
            description="Creamy tomato gravy with soft paneer cubes.",
            per_plate_cost=90.0, selling_price=180.0, is_veg=True,
            course=DishCourse.main, cuisine_type=CuisineType.mughlai,
            dietary_tags=["vegetarian"], tags=["crowd-pleaser"],
            preparation_time_minutes=30,
            recipe_ingredients=[ri(3,3,"kg"), ri(6,4,"kg"), ri(11,2,"L"), ri(4,100,"g")],
        ),
        dict(
            name="Seekh Kebab",
            category="Starter",
            description="Minced mutton kebabs grilled on skewers.",
            per_plate_cost=80.0, selling_price=160.0, is_veg=False,
            course=DishCourse.starter, cuisine_type=CuisineType.mughlai,
            dietary_tags=["halal"], tags=["starter", "live-counter"],
            preparation_time_minutes=20,
            recipe_ingredients=[ri(2,5,"kg"), ri(4,150,"g"), ri(7,2,"kg")],
        ),
        dict(
            name="Veg Shammi Kebab",
            category="Starter",
            description="Pan-fried lentil & spice patties — perfect veg starter.",
            per_plate_cost=50.0, selling_price=120.0, is_veg=True,
            course=DishCourse.starter, cuisine_type=CuisineType.mughlai,
            dietary_tags=["vegetarian"], tags=["starter"],
            preparation_time_minutes=25,
            recipe_ingredients=[ri(4,120,"g"), ri(7,2,"kg")],
        ),
        dict(
            name="Dal Makhani",
            category="Curry",
            description="Black lentils slow-cooked overnight with cream and butter.",
            per_plate_cost=40.0, selling_price=90.0, is_veg=True,
            course=DishCourse.main, cuisine_type=CuisineType.mughlai,
            dietary_tags=["vegetarian"], tags=["comfort-food"],
            preparation_time_minutes=45,
            recipe_ingredients=[ri(11,1.5,"L"), ri(4,80,"g"), ri(6,2,"kg")],
        ),
        dict(
            name="Gulab Jamun",
            category="Dessert",
            description="Soft milk-solid dumplings soaked in rose syrup.",
            per_plate_cost=25.0, selling_price=60.0, is_veg=True,
            course=DishCourse.dessert, cuisine_type=CuisineType.mughlai,
            dietary_tags=["vegetarian", "contains-dairy"], tags=["dessert", "bestseller"],
            preparation_time_minutes=40,
            recipe_ingredients=[ri(9,10,"L"), ri(14,4,"kg"), ri(10,0.5,"kg")],
        ),
        dict(
            name="Double Ka Meetha",
            category="Dessert",
            description="Hyderabadi bread pudding with condensed milk and dry fruits.",
            per_plate_cost=35.0, selling_price=80.0, is_veg=True,
            course=DishCourse.dessert, cuisine_type=CuisineType.hyderabadi,
            dietary_tags=["vegetarian"], tags=["dessert", "signature"],
            preparation_time_minutes=50,
            recipe_ingredients=[ri(9,8,"L"), ri(14,3,"kg"), ri(10,1,"kg"), ri(12,3,"g")],
        ),
        dict(
            name="Roomali Roti",
            category="Bread",
            description="Paper-thin hand-made rotis folded like a handkerchief.",
            per_plate_cost=15.0, selling_price=35.0, is_veg=True,
            course=DishCourse.bread, cuisine_type=CuisineType.mughlai,
            dietary_tags=["vegetarian"], tags=["bread"],
            preparation_time_minutes=10,
            recipe_ingredients=[],
        ),
        dict(
            name="Butter Naan",
            category="Bread",
            description="Leavened bread baked in a tandoor, brushed with butter.",
            per_plate_cost=18.0, selling_price=40.0, is_veg=True,
            course=DishCourse.bread, cuisine_type=CuisineType.mughlai,
            dietary_tags=["vegetarian"], tags=["bread"],
            preparation_time_minutes=10,
            recipe_ingredients=[ri(11,0.5,"L")],
        ),
        dict(
            name="Chicken Shorba",
            category="Soup",
            description="Clear spiced chicken broth with fresh herbs.",
            per_plate_cost=30.0, selling_price=70.0, is_veg=False,
            course=DishCourse.soup, cuisine_type=CuisineType.hyderabadi,
            dietary_tags=["halal"], tags=["soup"],
            preparation_time_minutes=40,
            recipe_ingredients=[ri(1,3,"kg"), ri(4,100,"g")],
        ),
        dict(
            name="Kashmiri Pulao",
            category="Rice",
            description="Fragrant rice with dry fruits and saffron milk.",
            per_plate_cost=70.0, selling_price=160.0, is_veg=True,
            course=DishCourse.main, cuisine_type=CuisineType.mughlai,
            dietary_tags=["vegetarian"], tags=["veg-special"],
            preparation_time_minutes=35,
            recipe_ingredients=[ri(0,6,"kg"), ri(10,1,"kg"), ri(12,4,"g"), ri(13,80,"g")],
        ),
        dict(
            name="Shahi Tukda",
            category="Dessert",
            description="Fried bread topped with thickened milk and saffron.",
            per_plate_cost=40.0, selling_price=85.0, is_veg=True,
            course=DishCourse.dessert, cuisine_type=CuisineType.hyderabadi,
            dietary_tags=["vegetarian", "contains-dairy"], tags=["dessert"],
            preparation_time_minutes=35,
            recipe_ingredients=[ri(9,8,"L"), ri(14,2,"kg"), ri(12,3,"g"), ri(10,0.5,"kg")],
        ),
        dict(
            name="Haleem",
            category="Main",
            description="Slow-cooked lentil and meat stew — Hyderabad's pride.",
            per_plate_cost=150.0, selling_price=280.0, is_veg=False,
            course=DishCourse.main, cuisine_type=CuisineType.hyderabadi,
            dietary_tags=["halal"], tags=["signature", "winter-special"],
            preparation_time_minutes=180,
            recipe_ingredients=[ri(2,6,"kg"), ri(4,200,"g"), ri(7,3,"kg"), ri(6,2,"kg")],
        ),
        dict(
            name="Kadhi Pakora",
            category="Curry",
            description="Besan fritters in a tangy yoghurt gravy.",
            per_plate_cost=35.0, selling_price=80.0, is_veg=True,
            course=DishCourse.main, cuisine_type=CuisineType.south_indian,
            dietary_tags=["vegetarian", "contains-dairy"], tags=["comfort-food"],
            preparation_time_minutes=30,
            recipe_ingredients=[ri(9,3,"L"), ri(4,80,"g"), ri(7,1.5,"kg")],
        ),
    ]

    dishes = []
    for d in rows:
        dish = Dish(
            org_id=org.id,
            name=d["name"],
            category=d["category"],
            description=d.get("description"),
            per_plate_cost=d["per_plate_cost"],
            selling_price=d["selling_price"],
            is_veg=d["is_veg"],
            course=d.get("course"),
            cuisine_type=d.get("cuisine_type"),
            dietary_tags=d.get("dietary_tags", []),
            tags=d.get("tags", []),
            preparation_time_minutes=d.get("preparation_time_minutes"),
            recipe_ingredients=d.get("recipe_ingredients", []),
            is_active=True,
            is_available_for_storefront=True,
        )
        await dish.insert()
        dishes.append(dish)
    print(f"  ✓ Dishes        : {len(dishes)} inserted")
    return dishes


async def seed_leads(org: Organisation, users: list[User]) -> list[Lead]:
    rows = [
        dict(
            name="Imran Khan", phone="+91-9900112233", email="imran.khan@gmail.com",
            event_type="Wedding",
            approx_date=today(60), approx_guest_count=500,
            status=LeadStatus.new,
            source="Instagram", notes="Planning a 3-day wedding package",
            budget=500000.0, ceremony_type=CeremonyType.nikah,
            food_preference=FoodPreference.non_veg,
            service_style=ServiceStyle.buffet,
            follow_up_date=today(3),
        ),
        dict(
            name="Priya Sharma", phone="+91-9811223344", email="priya.s@outlook.com",
            event_type="Birthday",
            approx_date=today(30), approx_guest_count=100,
            status=LeadStatus.quoted,
            source="Referral", notes="Daughter's 18th birthday party",
            budget=80000.0, ceremony_type=CeremonyType.birthday,
            food_preference=FoodPreference.veg,
            service_style=ServiceStyle.plated,
        ),
        dict(
            name="Tech Innovators Ltd.", phone="+91-9700334455",
            email="hr@techinnovators.com",
            event_type="Corporate Lunch",
            approx_date=today(15), approx_guest_count=200,
            status=LeadStatus.won,
            source="LinkedIn", notes="Quarterly town-hall catering",
            budget=150000.0, ceremony_type=CeremonyType.corporate,
            food_preference=FoodPreference.mixed,
            service_style=ServiceStyle.live_counter,
        ),
        dict(
            name="Fatima Siddiqui", phone="+91-9600445566", email=None,
            event_type="Walima",
            approx_date=today(90), approx_guest_count=800,
            status=LeadStatus.negotiating,
            source="Walk-in",
            budget=800000.0, ceremony_type=CeremonyType.walima,
            food_preference=FoodPreference.non_veg,
            service_style=ServiceStyle.buffet,
            follow_up_date=today(7),
        ),
        dict(
            name="Raju Reddy", phone="+91-9500556677", email="raju@reddyevents.com",
            event_type="Reception",
            approx_date=today(-15), approx_guest_count=300,
            status=LeadStatus.lost,
            source="Google Search", notes="Went with competitor pricing",
            budget=200000.0, ceremony_type=CeremonyType.reception,
            food_preference=FoodPreference.mixed,
        ),
    ]
    leads = []
    for r in rows:
        lead = Lead(org_id=org.id, assigned_to=users[1].id, **r)  # type: ignore[arg-type]
        await lead.insert()
        leads.append(lead)
    print(f"  ✓ Leads         : {len(leads)} inserted")
    return leads


async def seed_customers(org: Organisation, leads: list[Lead]) -> list[Customer]:
    rows = [
        dict(
            name="Imran Khan", phone="+91-9900112233", email="imran.khan@gmail.com",
            lead_id=leads[0].id,
            address="45, Banjara Hills Road No.3, Hyderabad",
            contact_type=ContactType.individual,
            communication_preference="WhatsApp",
            referral_source="Instagram",
        ),
        dict(
            name="Tech Innovators Ltd.", phone="+91-9700334455",
            email="hr@techinnovators.com",
            lead_id=leads[2].id,
            address="Plot 12, HITEC City, Hyderabad – 500081",
            company_name="Tech Innovators Ltd.",
            contact_type=ContactType.corporate,
            billing_address="Same as address",
            communication_preference="Email",
            referral_source="LinkedIn",
        ),
        dict(
            name="Fatima Siddiqui", phone="+91-9600445566", email="fatima.s@gmail.com",
            lead_id=leads[3].id,
            address="22, Tolichowki Main Road, Hyderabad",
            contact_type=ContactType.individual,
            communication_preference="Phone",
        ),
        dict(
            name="Al-Noor Wedding Planners", phone="+91-9800667788",
            email="bookings@alnoor.com",
            address="Plaza Towers, Madhapur, Hyderabad",
            company_name="Al-Noor Wedding Planners",
            contact_type=ContactType.wedding_planner,
            communication_preference="Email",
            referral_source="Trade Fair",
        ),
        dict(
            name="Sunrise Banquet Hall", phone="+91-9100778899",
            email="events@sunrisebanquet.com",
            address="Survey No. 12, Gachibowli, Hyderabad",
            company_name="Sunrise Banquet Hall",
            contact_type=ContactType.venue,
            communication_preference="Email",
        ),
    ]
    customers = []
    for r in rows:
        cust = Customer(org_id=org.id, **r)
        await cust.insert()
        customers.append(cust)
    print(f"  ✓ Customers     : {len(customers)} inserted")
    return customers


async def seed_bookings(org: Organisation, customers: list[Customer],
                        users: list[User]) -> list[Booking]:
    rows = [
        dict(
            customer=customers[0],
            title="Imran Khan Wedding Package",
            status=BookingStatus.confirmed,
            deposit_amount=100000.0,
            deposit_due_date=today(7),
            deposit_paid_date=today(-2),
            contract_signed=True,
            contract_signed_date=today(-5),
            minimum_guarantee=450,
            payment_terms="50% advance, 50% before event day.",
            cancellation_policy="Non-refundable after 14 days of signing.",
            special_instructions="Halal-only kitchen. No alcohol on premises.",
            booking_manager_id=users[1].id,
        ),
        dict(
            customer=customers[1],
            title="Tech Innovators Q2 Town-Hall",
            status=BookingStatus.in_progress,
            deposit_amount=30000.0,
            deposit_paid_date=today(-10),
            contract_signed=True,
            contract_signed_date=today(-12),
            minimum_guarantee=180,
            payment_terms="Full payment 3 days before event.",
            booking_manager_id=users[1].id,
        ),
        dict(
            customer=customers[2],
            title="Fatima Walima Ceremony",
            status=BookingStatus.confirmed,
            deposit_amount=200000.0,
            deposit_due_date=today(14),
            contract_signed=False,
            minimum_guarantee=700,
            payment_terms="50% advance, 50% on event day.",
            booking_manager_id=users[1].id,
        ),
        dict(
            customer=customers[3],
            title="Al-Noor Mehendi Night",
            status=BookingStatus.completed,
            deposit_amount=40000.0,
            deposit_paid_date=today(-30),
            contract_signed=True,
            contract_signed_date=today(-35),
            minimum_guarantee=150,
            payment_terms="Full payment in advance.",
            booking_manager_id=users[1].id,
        ),
    ]
    bookings = []
    for r in rows:
        b = Booking(org_id=org.id, **r)
        await b.insert()
        bookings.append(b)
    print(f"  ✓ Bookings      : {len(bookings)} inserted")
    return bookings


async def seed_events(org: Organisation, bookings: list[Booking],
                      dishes: list[Dish]) -> list[Event]:
    dish_ids = [d.id for d in dishes[:8]]

    rows = [
        dict(
            booking=bookings[0],
            name="Nikah Ceremony",
            date=today(60), venue="Taj Falaknuma Palace, Hyderabad",
            guest_count=500, catering_model=CateringModel.per_plate,
            ceremony_type=CeremonyType.nikah,
            service_style=ServiceStyle.buffet,
            food_preference=FoodPreference.non_veg,
            event_status=EventStatus.confirmed,
            veg_count=100, non_veg_count=400,
            menu_dish_ids=dish_ids[:6],
            staffing_requirements=30,
            kitchen_notes="Mutton Biryani is the hero dish. Ensure dum is intact.",
        ),
        dict(
            booking=bookings[0],
            name="Walima Reception",
            date=today(62), venue="Taj Falaknuma Palace, Hyderabad",
            guest_count=600, catering_model=CateringModel.per_plate,
            ceremony_type=CeremonyType.walima,
            service_style=ServiceStyle.buffet,
            food_preference=FoodPreference.non_veg,
            event_status=EventStatus.confirmed,
            menu_dish_ids=dish_ids[:8],
            staffing_requirements=35,
        ),
        dict(
            booking=bookings[1],
            name="Q2 Town-Hall Lunch",
            date=today(15), venue="Tech Innovators, HITEC City Auditorium",
            guest_count=200, catering_model=CateringModel.chef_driven,
            ceremony_type=CeremonyType.corporate,
            service_style=ServiceStyle.live_counter,
            food_preference=FoodPreference.mixed,
            event_status=EventStatus.deposit_received,
            veg_count=80, non_veg_count=120,
            menu_dish_ids=dish_ids[2:7],
            staffing_requirements=12,
            access_instructions="Gate pass required. Contact HR at security desk.",
        ),
        dict(
            booking=bookings[2],
            name="Fatima Walima",
            date=today(90), venue="Green Park Banquet, Tolichowki",
            guest_count=800, catering_model=CateringModel.per_plate,
            ceremony_type=CeremonyType.walima,
            service_style=ServiceStyle.buffet,
            food_preference=FoodPreference.non_veg,
            event_status=EventStatus.enquiry,
            menu_dish_ids=dish_ids,
            staffing_requirements=50,
        ),
        dict(
            booking=bookings[3],
            name="Mehendi Night",
            date=today(-30), venue="Al-Noor Office Garden, Madhapur",
            guest_count=150, catering_model=CateringModel.per_plate,
            ceremony_type=CeremonyType.mehendi,
            service_style=ServiceStyle.family,
            food_preference=FoodPreference.mixed,
            event_status=EventStatus.completed,
            actual_headcount=145,
            menu_dish_ids=dish_ids[2:6],
            staffing_requirements=10,
        ),
        dict(
            booking=bookings[3],
            name="Post-Mehendi Dinner",
            date=today(-30), venue="Al-Noor Office Garden, Madhapur",
            guest_count=80, catering_model=CateringModel.per_plate,
            ceremony_type=CeremonyType.mehendi,
            service_style=ServiceStyle.buffet,
            food_preference=FoodPreference.mixed,
            event_status=EventStatus.completed,
            actual_headcount=76,
            menu_dish_ids=dish_ids[:4],
            staffing_requirements=6,
        ),
    ]
    events = []
    for r in rows:
        ev = Event(org_id=org.id, **r)
        await ev.insert()
        events.append(ev)
    print(f"  ✓ Events        : {len(events)} inserted")
    return events


async def seed_quotations(org: Organisation, bookings: list[Booking],
                          events: list[Event], dishes: list[Dish]) -> list[Quotation]:
    dish_ids = [d.id for d in dishes]

    records = [
        # Booking 0: Nikah — approved v1, superseded
        dict(
            booking_id=bookings[0], event_id=events[0].id,
            version=1, status=QuotationStatus.superseded,
            guest_count=500, dish_slice=slice(0, 5),
            discount=5000.0, valid_until=today(-10),
            notes="Initial quote — revised after venue change.",
        ),
        # Booking 0: Nikah — v2 approved
        dict(
            booking_id=bookings[0], event_id=events[0].id,
            version=2, status=QuotationStatus.approved,
            guest_count=500, dish_slice=slice(0, 6),
            discount=0.0, valid_until=today(30),
            deposit_percentage=50.0,
            notes="Revised quotation with updated menu.",
        ),
        # Booking 1: Corporate — sent
        dict(
            booking_id=bookings[1], event_id=events[2].id,
            version=1, status=QuotationStatus.sent,
            guest_count=200, dish_slice=slice(2, 7),
            discount=2000.0, valid_until=today(7),
            notes="Live counter arrangement included.",
        ),
        # Booking 2: Fatima — draft
        dict(
            booking_id=bookings[2], event_id=events[3].id,
            version=1, status=QuotationStatus.draft,
            guest_count=800, dish_slice=slice(0, 8),
            discount=0.0, valid_until=today(45),
            deposit_percentage=50.0,
            notes="Preliminary quote pending final menu selection.",
        ),
    ]

    quotations = []
    for r in records:
        gc = r["guest_count"]
        items = make_line_items(dish_ids[r["dish_slice"]], gc)
        totals = calc_totals(items, discount=r["discount"])
        dep_pct = r.get("deposit_percentage", 0.0)
        dep_amt = round(totals["total"] * dep_pct / 100, 2) if dep_pct else 0.0

        q = Quotation(
            org_id=org.id,
            booking_id=r["booking_id"],
            event_id=r.get("event_id"),
            version=r["version"],
            status=r["status"],
            line_items=items,
            valid_until=r.get("valid_until"),
            notes=r.get("notes"),
            deposit_percentage=r.get("deposit_percentage"),
            deposit_amount=dep_amt,
            deposit_due_date=today(7) if dep_amt else None,
            payment_terms_text="50% advance, 50% before event.",
            cancellation_policy_text="Non-refundable deposit after 14 days.",
            minimum_guarantee_count=int(gc * 0.9),
            client_signature_status="signed" if r["status"] == QuotationStatus.approved else "unsigned",
            signed_date=today(-5) if r["status"] == QuotationStatus.approved else None,
            **totals,
        )
        await q.insert()
        quotations.append(q)
    print(f"  ✓ Quotations    : {len(quotations)} inserted")
    return quotations


async def seed_invoices(org: Organisation, bookings: list[Booking],
                        quotations: list[Quotation], dishes: list[Dish]) -> list[Invoice]:
    dish_ids = [d.id for d in dishes]

    records = [
        # Booking 1: Corporate — paid
        dict(
            booking_id=bookings[1], quotation_id=quotations[2],
            invoice_number="ZYF-2025-001",
            status=InvoiceStatus.paid,
            guest_count=200, dish_slice=slice(2, 7),
            discount=2000.0,
            invoice_date=today(-12), due_date=today(-3),
            amount_paid=None,  # computed from total
            payment_method="NEFT", payment_received_date=today(-3),
            attendees_count=195,
        ),
        # Booking 3: Al-Noor Mehendi — paid
        dict(
            booking_id=bookings[3], quotation_id=None,
            invoice_number="ZYF-2025-002",
            status=InvoiceStatus.paid,
            guest_count=150, dish_slice=slice(2, 6),
            discount=0.0,
            invoice_date=today(-32), due_date=today(-30),
            amount_paid=None,
            payment_method="Cheque", payment_received_date=today(-30),
            attendees_count=145,
        ),
        # Booking 0: Nikah — sent (advance invoice)
        dict(
            booking_id=bookings[0], quotation_id=quotations[1],
            invoice_number="ZYF-2025-003",
            status=InvoiceStatus.sent,
            guest_count=500, dish_slice=slice(0, 6),
            discount=0.0,
            invoice_date=today(-2), due_date=today(7),
            amount_paid=0.0,
            payment_method=None,
            attendees_count=None,
        ),
        # Booking 2: Fatima — draft
        dict(
            booking_id=bookings[2], quotation_id=quotations[3],
            invoice_number="ZYF-2025-004",
            status=InvoiceStatus.draft,
            guest_count=800, dish_slice=slice(0, 8),
            discount=0.0,
            invoice_date=today(), due_date=today(30),
            amount_paid=0.0,
            payment_method=None,
            attendees_count=None,
        ),
    ]

    invoices = []
    for r in records:
        gc = r["guest_count"]
        items = make_line_items(dish_ids[r["dish_slice"]], gc)
        totals = calc_totals(items, discount=r["discount"])
        paid = r["amount_paid"] if r["amount_paid"] is not None else totals["total"]
        balance = round(totals["total"] - paid, 2)

        inv = Invoice(
            org_id=org.id,
            booking_id=r["booking_id"],
            quotation_id=r["quotation_id"],
            invoice_number=r["invoice_number"],
            status=r["status"],
            line_items=items,
            subtotal=totals["subtotal"],
            discount=totals["discount"],
            service_charge_amount=totals["service_charge_amount"],
            tax_amount=totals["tax_amount"],
            gratuity_amount=0.0,
            total=totals["total"],
            invoice_date=r.get("invoice_date"),
            due_date=r.get("due_date"),
            amount_paid=paid,
            balance_due=balance,
            payment_method=r.get("payment_method"),
            payment_received_date=r.get("payment_received_date"),
            attendees_count=r.get("attendees_count"),
            notes="Thank you for choosing Al-Baraka Catering Co.",
        )
        await inv.insert()
        invoices.append(inv)
    print(f"  ✓ Invoices      : {len(invoices)} inserted")
    return invoices


# ─────────────────────────────────────────────────────────
# Clear all collections
# ─────────────────────────────────────────────────────────

async def clear_all() -> None:
    print("  Clearing all collections...")
    await Invoice.find_all().delete()
    await Quotation.find_all().delete()
    await Event.find_all().delete()
    await Booking.find_all().delete()
    await Customer.find_all().delete()
    await Lead.find_all().delete()
    await Dish.find_all().delete()
    await Ingredient.find_all().delete()
    await User.find_all().delete()
    await Organisation.find_all().delete()
    print("  ✓ All collections cleared")


# ─────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────

async def main(clear: bool = False) -> None:
    print("Connecting to database...")
    await init_db()

    try:
        if clear:
            await clear_all()
        else:
            existing = await Organisation.find_all().count()
            if existing > 0:
                print(f"  Data already exists ({existing} organisation(s)). Use --clear to reseed.")
                return

        print("\nSeeding...")
        org         = await seed_organisation()
        users       = await seed_users(org)
        ingredients = await seed_ingredients(org)
        dishes      = await seed_dishes(org, ingredients)
        leads       = await seed_leads(org, users)
        customers   = await seed_customers(org, leads)
        bookings    = await seed_bookings(org, customers, users)
        events      = await seed_events(org, bookings, dishes)
        quotations  = await seed_quotations(org, bookings, events, dishes)
        invoices    = await seed_invoices(org, bookings, quotations, dishes)

        print(f"\n✅ Seed complete!")
        print(f"   org_id       = {org.id}")
        print(f"   Login        : raheel@albaraka.in / Admin@123")
        print(f"   Manager      : sana@albaraka.in  / Manager@123")

    finally:
        await close_db()


if __name__ == "__main__":
    do_clear = "--clear" in sys.argv
    if "--help" in sys.argv:
        print(__doc__)
        sys.exit(0)
    asyncio.run(main(clear=do_clear))
