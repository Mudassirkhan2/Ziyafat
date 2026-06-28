from enum import Enum


class CeremonyType(str, Enum):
    nikah = "nikah"
    walima = "walima"
    mehendi = "mehendi"
    reception = "reception"
    aqiqah = "aqiqah"
    birthday = "birthday"
    corporate = "corporate"
    other = "other"


class ServiceStyle(str, Enum):
    buffet = "buffet"
    plated = "plated"
    live_counter = "live_counter"
    family = "family"
    stations = "stations"
    combo = "combo"


class FoodPreference(str, Enum):
    veg = "veg"
    non_veg = "non_veg"
    mixed = "mixed"
    jain = "jain"
    vegan = "vegan"


class DishCourse(str, Enum):
    starter = "starter"
    soup = "soup"
    main = "main"
    dessert = "dessert"
    beverage = "beverage"
    snack = "snack"
    bread = "bread"


class CuisineType(str, Enum):
    hyderabadi = "hyderabadi"
    mughlai = "mughlai"
    continental = "continental"
    chinese = "chinese"
    south_indian = "south_indian"
    italian = "italian"
    other = "other"


class ContactType(str, Enum):
    individual = "individual"
    corporate = "corporate"
    wedding_planner = "wedding_planner"
    venue = "venue"
    ngo = "ngo"


class IngredientCategory(str, Enum):
    produce = "produce"
    dairy = "dairy"
    protein = "protein"
    dry_goods = "dry_goods"
    spices = "spices"
    oils = "oils"
    beverages = "beverages"
    other = "other"


class EventStatus(str, Enum):
    enquiry = "enquiry"
    confirmed = "confirmed"
    deposit_received = "deposit_received"
    event_day = "event_day"
    completed = "completed"
    cancelled = "cancelled"
