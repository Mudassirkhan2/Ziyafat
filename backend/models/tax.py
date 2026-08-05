from enum import Enum
from datetime import datetime, timezone
from beanie import Document, PydanticObjectId
from pydantic import Field
from pymongo import ASCENDING, IndexModel


class TaxCalculationMethod(str, Enum):
    additive = "additive"
    inclusive = "inclusive"


class TaxItemMode(str, Enum):
    same_for_all = "same_for_all"
    different_per_item = "different_per_item"


class Tax(Document):
    org_id: PydanticObjectId
    name: str
    rate: float
    calculation_method: TaxCalculationMethod = TaxCalculationMethod.additive
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "taxes"
        indexes = [IndexModel([("org_id", ASCENDING)])]
