from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import require_role
from app.core.database import get_db
from app.models.user import User
from app.models.specification import ProductSpecification
from app.schemas.specification import ProductSpecificationResponse, SpecificationCreate
from app.services.cache_service import delete, delete_pattern

router = APIRouter(prefix="/api/products", tags=["Product Specifications"])


@router.post("/{product_id}/specifications", response_model=ProductSpecificationResponse)
def create_product_specification(
    product_id: int,
    specification: SpecificationCreate,
    db: Session = Depends(get_db),
    seller: User = Depends(require_role("seller")),
):
    new_specification = ProductSpecification(
        product_id=product_id,
        **specification.model_dump()
    )
    db.add(new_specification)
    db.commit()
    db.refresh(new_specification)
    delete(f"products:{product_id}")
    delete("products:list")
    delete_pattern("search:products:*")
    delete_pattern(f"comparison:{product_id}:*")
    return new_specification


@router.get("/{product_id}/specifications", response_model=list[ProductSpecificationResponse])
def get_product_specifications(product_id: int, db: Session = Depends(get_db)):
    return db.query(ProductSpecification).filter(
        ProductSpecification.product_id == product_id
    ).all()