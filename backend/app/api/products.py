from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.product import Product
from app.schemas.product import ProductCreate,ProductResponse

router=APIRouter(
    prefix="/api/products",
    tags=["Products"]

)

@router.post("/",response_model=ProductResponse)
def create_product(
    product:ProductCreate,
    db:Session=Depends(get_db)
):
    new_product=Product(
        name=product.name,
        asin=product.asin,
        brand=product.brand,
        category_id=product.category_id
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product

@router.get("/",response_model=list[ProductResponse])
def get_product(
    db:Session=Depends(get_db)

):
    products=db.query(Product).all()

    return products
