from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import require_role
from app.core.catalog import ELECTRONICS_CATEGORIES
from app.core.database import get_db
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryResponse
from app.models.user import User
from app.services.cache_service import delete, get_json, set_json

router = APIRouter(prefix="/api/categories", tags=["Categories"])


@router.post("/", response_model=CategoryResponse)
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    seller: User = Depends(require_role("seller")),
):
    normalized_name = category.name.strip().lower()
    if normalized_name not in ELECTRONICS_CATEGORIES:
        raise HTTPException(status_code=400, detail="Only approved electronics categories are supported")
    new_category = Category(name=category.name)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    delete("categories:list")
    return new_category


@router.get("/", response_model=list[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    cached = get_json("categories:list")
    if cached is not None:
        return cached
    data = [CategoryResponse.model_validate(category).model_dump(mode="json") for category in db.query(Category).all()]
    set_json("categories:list", data, ttl=3600)
    return data