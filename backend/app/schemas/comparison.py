from pydantic import BaseModel


class SellerSpecification(BaseModel):
    specification_name: str
    specification_value: str


class SpecificationMode(BaseModel):
    specification_name: str
    mode_value: str | None = None
    frequency: int


class ManufacturerSpecification(BaseModel):
    specification_name: str
    specification_value: str


class SellerListing(BaseModel):
    listing_id: int
    seller_name: str | None = None
    source: str
    specifications: list[SellerSpecification]


class ComparisonResponse(BaseModel):
    product_id: int
    current_listing_id: int | None
    seller_listings: list[SellerListing]
    seller_modes: list[SpecificationMode]
    manufacturer_specifications: list[ManufacturerSpecification]
    discrepancies: list[str]