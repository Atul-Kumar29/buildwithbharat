from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import require_role
from app.core.database import get_db
from app.models.manufacturer_specification import ManufacturerSpecification
from app.models.user import User
from app.schemas.manufacturer_specification import (
    ManufacturerSpecificationCreate,
    ManufacturerSpecificationResponse,
)

router = APIRouter(
    prefix="/api/products",
    tags=["Manufacturer Specifications"],
)


@router.post(
    "/{product_id}/manufacturer-specifications",
    response_model=ManufacturerSpecificationResponse,
)
def create_manufacturer_specification(
    product_id: int,
    specification: ManufacturerSpecificationCreate,
    db: Session = Depends(get_db),
    seller: User = Depends(require_role("seller")),
):
    new_specification = ManufacturerSpecification(
        product_id=product_id,
        **specification.model_dump(),
    )

    db.add(new_specification)
    db.commit()
    db.refresh(new_specification)

    return new_specification


@router.get(
    "/{product_id}/manufacturer-specifications",
    response_model=list[ManufacturerSpecificationResponse],
)
def get_manufacturer_specifications(
    product_id: int,
    db: Session = Depends(get_db),
):
    return (
        db.query(ManufacturerSpecification)
        .filter(
            ManufacturerSpecification.product_id == product_id
        )
        .all()
    )