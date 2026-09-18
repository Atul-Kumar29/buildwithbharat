from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.product import Product
from app.schemas.product import ProductResponse
from app.services.cache_service import get_json, set_json

router = APIRouter(
    prefix="/api/search",
    tags=["Search"]
)


@router.get("/products", response_model=list[ProductResponse])
def search_products(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db)
):
    cache_key = f"search:products:{q.strip().lower()}"
    cached = get_json(cache_key)
    if cached is not None:
        return cached
    search_term = f"%{q}%"

    products = db.query(Product).filter(
        (Product.name.ilike(search_term)) |
        (Product.asin.ilike(search_term)) |
        (Product.brand.ilike(search_term))
    ).all()

    data = [ProductResponse.model_validate(product).model_dump(mode="json") for product in products]
    set_json(cache_key, data, ttl=60)
    return data