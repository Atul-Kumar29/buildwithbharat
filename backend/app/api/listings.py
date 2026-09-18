from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import require_role
from app.core.database import get_db
from app.models.listing import Listing
from app.models.specification import ListingSpecification
from app.models.user import User
from app.schemas.listing import ListingCreate, ListingResponse
from app.schemas.specification import ListingSpecificationResponse, SpecificationCreate
from app.services.cache_service import delete, delete_pattern

router = APIRouter(prefix="/api", tags=["Listings"])


@router.post("/listings/", response_model=ListingResponse)
def create_listing(
    listing: ListingCreate,
    db: Session = Depends(get_db),
    seller: User = Depends(require_role("seller")),
):
    new_listing = Listing(**listing.model_dump())
    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)
    delete(f"products:{listing.product_id}")
    delete_pattern(f"comparison:{listing.product_id}:*")
    return new_listing


@router.get("/listings/", response_model=list[ListingResponse])
def get_listings(db: Session = Depends(get_db)):
    return db.query(Listing).all()


@router.post("/listings/{listing_id}/specifications", response_model=ListingSpecificationResponse)
def create_listing_specification(
    listing_id: int,
    specification: SpecificationCreate,
    db: Session = Depends(get_db),
    seller: User = Depends(require_role("seller")),
):
    new_specification = ListingSpecification(
        listing_id=listing_id,
        **specification.model_dump()
    )
    db.add(new_specification)
    db.commit()
    db.refresh(new_specification)
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if listing:
        delete(f"products:{listing.product_id}")
        delete_pattern(f"comparison:{listing.product_id}:*")
    return new_specification


@router.get("/listings/{listing_id}/specifications", response_model=list[ListingSpecificationResponse])
def get_listing_specifications(listing_id: int, db: Session = Depends(get_db)):
    return db.query(ListingSpecification).filter(
        ListingSpecification.listing_id == listing_id
    ).all()