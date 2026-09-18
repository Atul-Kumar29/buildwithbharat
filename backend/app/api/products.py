from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session

from app.core.auth import require_role
from app.core.catalog import ELECTRONICS_CATEGORIES
from app.core.database import get_db
from app.models.category import Category
from app.models.product import Product
from app.models.user import User
from app.schemas.product import ProductCreate,ProductResponse
from app.services.cache_service import delete, delete_pattern, get_json, set_json

router=APIRouter(
    prefix="/api/products",
    tags=["Products"]

)

@router.post("/",response_model=ProductResponse)
def create_product(
    product:ProductCreate,
    db:Session=Depends(get_db),
    seller: User = Depends(require_role("seller")),
):
    if product.category_id is not None:
        category = db.query(Category).filter_by(id=product.category_id).first()
        if category is None or category.name.strip().lower() not in ELECTRONICS_CATEGORIES:
            raise HTTPException(status_code=400, detail="Only approved electronics categories are supported")
    new_product=Product(
        name=product.name,
        asin=product.asin,
        brand=product.brand,
        category_id=product.category_id
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    delete("products:list")
    delete_pattern("search:products:*")

    return new_product

@router.get("/",response_model=list[ProductResponse])
def get_product(
    db:Session=Depends(get_db)

):
    cached = get_json("products:list")
    if cached is not None:
        return cached
    products=db.query(Product).all()
    data = [ProductResponse.model_validate(product).model_dump(mode="json") for product in products]
    set_json("products:list", data, ttl=60)

    return data

@router.get("/{product_id}", response_model=ProductResponse)
def get_product_by_id(product_id: int, db: Session = Depends(get_db)):
    cached = get_json(f"products:{product_id}")
    if cached is not None:
        return cached
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    data = ProductResponse.model_validate(product).model_dump(mode="json")
    set_json(f"products:{product_id}", data, ttl=300)
    return data

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    seller: User = Depends(require_role("seller")),
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    db.delete(product)
    db.commit()
    delete(f"products:{product_id}")
    delete("products:list")
    delete_pattern("search:products:*")

    return {
        "message": "Product deleted successfully"
    }