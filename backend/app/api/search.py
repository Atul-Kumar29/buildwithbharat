from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.product import Product
from app.schemas.product import ProductResponse

router = APIRouter(
    prefix="/api/search",
    tags=["Search"]
)


@router.get("/products", response_model=list[ProductResponse])
def search_products(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db)
):
    search_term = f"%{q}%"

    products = db.query(Product).filter(
        (Product.name.ilike(search_term)) |
        (Product.asin.ilike(search_term)) |
        (Product.brand.ilike(search_term))
    ).all()

    return products