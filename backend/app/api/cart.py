from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import require_role
from app.core.database import get_db
from app.models.cart import CartItem
from app.models.product import Product
from app.models.user import User
from app.schemas.cart import CartItemCreate, CartItemResponse, CartItemUpdate

router = APIRouter(prefix="/api/cart", tags=["Cart"])


@router.get("/", response_model=list[CartItemResponse])
def get_cart(user: User = Depends(require_role("buyer")), db: Session = Depends(get_db)):
    return db.query(CartItem).filter(CartItem.user_id == user.id).all()


@router.post("/items", response_model=CartItemResponse, status_code=status.HTTP_201_CREATED)
def add_cart_item(
    item: CartItemCreate,
    user: User = Depends(require_role("buyer")),
    db: Session = Depends(get_db),
):
    if db.query(Product).filter(Product.id == item.product_id).first() is None:
        raise HTTPException(status_code=404, detail="Product not found")

    cart_item = db.query(CartItem).filter(
        CartItem.user_id == user.id,
        CartItem.product_id == item.product_id,
    ).first()
    if cart_item:
        cart_item.quantity += item.quantity
    else:
        cart_item = CartItem(user_id=user.id, **item.model_dump())
        db.add(cart_item)
    db.commit()
    db.refresh(cart_item)
    return cart_item


@router.patch("/items/{product_id}", response_model=CartItemResponse)
def update_cart_item(
    product_id: int,
    item: CartItemUpdate,
    user: User = Depends(require_role("buyer")),
    db: Session = Depends(get_db),
):
    cart_item = db.query(CartItem).filter(
        CartItem.user_id == user.id,
        CartItem.product_id == product_id,
    ).first()
    if cart_item is None:
        raise HTTPException(status_code=404, detail="Cart item not found")
    cart_item.quantity = item.quantity
    db.commit()
    db.refresh(cart_item)
    return cart_item


@router.delete("/items/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_cart_item(
    product_id: int,
    user: User = Depends(require_role("buyer")),
    db: Session = Depends(get_db),
):
    cart_item = db.query(CartItem).filter(
        CartItem.user_id == user.id,
        CartItem.product_id == product_id,
    ).first()
    if cart_item is None:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(cart_item)
    db.commit()