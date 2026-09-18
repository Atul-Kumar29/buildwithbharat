from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import require_role
from app.core.database import get_db
from app.models.product import Product
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewResponse

router = APIRouter(prefix="/api/products", tags=["Reviews"])


@router.get("/{product_id}/reviews", response_model=list[ReviewResponse])
def get_reviews(product_id: int, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.product_id == product_id).order_by(Review.created_at.desc()).all()


@router.post("/{product_id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(product_id: int, review: ReviewCreate, user: User = Depends(require_role("buyer")), db: Session = Depends(get_db)):
    if db.query(Product).filter(Product.id == product_id).first() is None:
        raise HTTPException(status_code=404, detail="Product not found")
    if db.query(Review).filter(Review.product_id == product_id, Review.user_id == user.id).first():
        raise HTTPException(status_code=409, detail="You have already reviewed this product")
    record = Review(product_id=product_id, user_id=user.id, **review.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record