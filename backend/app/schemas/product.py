from pydantic import BaseModel, ConfigDict, Field

from app.schemas.category import CategoryResponse
from app.schemas.listing import ListingResponse
from app.schemas.specification import ProductSpecificationResponse


class ProductCreate(BaseModel):
    name: str
    asin: str | None = None
    brand: str | None = None
    category_id: int | None = None


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    asin: str | None
    brand: str | None
    category_id: int | None
    category: CategoryResponse | None = None
    listings: list[ListingResponse] = Field(default_factory=list)
    specifications: list[ProductSpecificationResponse] = Field(default_factory=list)


class ProductCreateResponse(BaseModel):
    product: ProductResponse
    created: bool