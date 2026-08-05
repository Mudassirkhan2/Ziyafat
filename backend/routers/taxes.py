from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from dependencies import get_current_user, require_role
from models.tax import Tax, TaxCalculationMethod
from models.user import User, UserRole


router = APIRouter(prefix="/api/v1/taxes", tags=["taxes"])


class CreateTaxBody(BaseModel):
    name: str
    rate: float
    calculation_method: TaxCalculationMethod = TaxCalculationMethod.additive
    is_active: bool = True


class UpdateTaxBody(BaseModel):
    name: Optional[str] = None
    rate: Optional[float] = None
    calculation_method: Optional[TaxCalculationMethod] = None
    is_active: Optional[bool] = None


class TaxResponse(BaseModel):
    id: str
    name: str
    rate: float
    calculation_method: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


def _tax_response(tax: Tax) -> TaxResponse:
    return TaxResponse(
        id=str(tax.id),
        name=tax.name,
        rate=tax.rate,
        calculation_method=tax.calculation_method,
        is_active=tax.is_active,
        created_at=tax.created_at,
        updated_at=tax.updated_at,
    )


@router.get("", response_model=list[TaxResponse])
async def list_taxes(current_user: User = Depends(get_current_user)):
    taxes = await Tax.find({"org_id": current_user.org_id}).to_list()
    return [_tax_response(t) for t in taxes]


@router.post("", response_model=TaxResponse, status_code=status.HTTP_201_CREATED)
async def create_tax(
    body: CreateTaxBody,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    now = datetime.now(timezone.utc)
    tax = Tax(
        org_id=current_user.org_id,
        name=body.name,
        rate=body.rate,
        calculation_method=body.calculation_method,
        is_active=body.is_active,
        created_at=now,
        updated_at=now,
    )
    await tax.insert()
    return _tax_response(tax)


@router.patch("/{tax_id}", response_model=TaxResponse)
async def update_tax(
    tax_id: str,
    body: UpdateTaxBody,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    tax = await Tax.get(tax_id)
    if not tax or tax.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Tax not found")
    if body.name is not None:
        tax.name = body.name
    if body.rate is not None:
        tax.rate = body.rate
    if body.calculation_method is not None:
        tax.calculation_method = body.calculation_method
    if body.is_active is not None:
        tax.is_active = body.is_active
    tax.updated_at = datetime.now(timezone.utc)
    await tax.save()
    return _tax_response(tax)


@router.delete("/{tax_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tax(
    tax_id: str,
    current_user: User = Depends(require_role(UserRole.owner, UserRole.manager)),
):
    tax = await Tax.get(tax_id)
    if not tax or tax.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Tax not found")
    await tax.delete()
