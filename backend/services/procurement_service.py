from dataclasses import dataclass
from typing import Optional
from models.dish import Dish
from models.ingredient import Ingredient

_CONVERT: dict[tuple[str, str], float] = {
    ("g", "kg"): 0.001, ("kg", "g"): 1000.0,
    ("ml", "L"): 0.001, ("L", "ml"): 1000.0,
}


def _to_base(qty: float, from_unit: str, base_unit: str) -> float:
    if from_unit == base_unit:
        return qty
    return qty * _CONVERT.get((from_unit, base_unit), 1.0)


@dataclass
class ProcurementItem:
    ingredient_id: str
    name: str
    quantity: float        # in base_unit, after wastage
    unit: str              # base_unit
    cost: float            # quantity * cost_per_unit
    supplier: Optional[str]


async def generate_procurement_list(
    dish_ids: list[str],
    guest_count: int,
    wastage_pct: float = 0.0,
) -> list[ProcurementItem]:
    """Explode dish recipes for guest_count guests, apply wastage, aggregate by ingredient."""
    multiplier = guest_count / 100.0 * (1 + wastage_pct / 100.0)

    totals: dict[str, dict] = {}

    for dish_id in dish_ids:
        dish = await Dish.get(dish_id)
        if dish is None:
            continue
        for ri in dish.recipe_ingredients:
            ing = await Ingredient.get(ri.ingredient_id)
            if ing is None or not ing.is_active:
                continue
            qty_base = _to_base(ri.quantity_per_100_guests, ri.unit, ing.base_unit) * multiplier
            ing_key = str(ing.id)
            if ing_key not in totals:
                totals[ing_key] = {
                    "name": ing.name,
                    "unit": ing.base_unit,
                    "cost_per_unit": ing.cost_per_unit,
                    "supplier": ing.supplier,
                    "qty": 0.0,
                }
            totals[ing_key]["qty"] += qty_base

    items = [
        ProcurementItem(
            ingredient_id=ing_id,
            name=data["name"],
            quantity=round(data["qty"], 3),
            unit=data["unit"],
            cost=round(data["qty"] * data["cost_per_unit"], 2),
            supplier=data["supplier"],
        )
        for ing_id, data in totals.items()
    ]

    items.sort(key=lambda x: (x.supplier or "zzz", x.name))
    return items
