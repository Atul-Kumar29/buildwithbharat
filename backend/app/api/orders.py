from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import require_role
from app.core.database import get_db
from app.models.order import Order
from app.models.product import Product
from app.models.user import User
from app.models.verification import FeatureVerification
from app.schemas.order import OrderCreate, OrderResponse, VerificationCreate, VerificationResponse

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def place_order(order: OrderCreate, user: User = Depends(require_role("buyer")), db: Session = Depends(get_db)):
    if db.query(Product).filter(Product.id == order.product_id).first() is None:
        raise HTTPException(status_code=404, detail="Product not found")
    record = Order(user_id=user.id, **order.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/", response_model=list[OrderResponse])
def get_orders(user: User = Depends(require_role("buyer")), db: Session = Depends(get_db)):
    return db.query(Order).filter(Order.user_id == user.id).order_by(Order.created_at.desc()).all()


@router.post("/{order_id}/deliver", response_model=OrderResponse)
def mark_delivered(order_id: int, user: User = Depends(require_role("buyer")), db: Session = Depends(get_db)):
    record = db.query(Order).filter(Order.id == order_id, Order.user_id == user.id).first()
    if record is None:
        raise HTTPException(status_code=404, detail="Order not found")
    record.status = "delivered"
    record.delivered_at = datetime.utcnow()
    db.commit()
    db.refresh(record)
    return record


@router.post("/{order_id}/verification", response_model=VerificationResponse, status_code=status.HTTP_201_CREATED)
def verify_features(order_id: int, verification: VerificationCreate, user: User = Depends(require_role("buyer")), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == user.id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != "delivered":
        raise HTTPException(status_code=400, detail="Feature verification is available after delivery")
    if db.query(FeatureVerification).filter(FeatureVerification.order_id == order_id).first():
        raise HTTPException(status_code=409, detail="This order has already been verified")
    record = FeatureVerification(order_id=order_id, user_id=user.id, **verification.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record