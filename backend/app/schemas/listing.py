from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.specification import ListingSpecificationResponse


class ListingCreate(BaseModel):
    product_id: int
    source_id: int | None = None
    source: str
    seller_name: str | None = None
    listing_url: str | None = None
    title: str | None = None


class ListingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    source_id: int | None
    source: str
    seller_name: str | None
    listing_url: str | None
    title: str | None
    created_at: datetime
    updated_at: datetime
    specifications: list[ListingSpecificationResponse] = Field(default_factory=list)