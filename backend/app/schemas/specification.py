from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SpecificationCreate(BaseModel):
    specification_name: str
    specification_value: str


class ProductSpecificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    specification_name: str
    specification_value: str
    created_at: datetime
    updated_at: datetime


class ListingSpecificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    listing_id: int
    specification_name: str
    specification_value: str
    created_at: datetime
    updated_at: datetime