from pydantic import BaseModel


class SpecificationMedian(BaseModel):
    specification_name: str
    median_value: float
    unit: str | None = None


class SpecificationMode(BaseModel):
    specification_name: str
    mode_values: list[str]
    frequency: int


class ManufacturerSpecification(BaseModel):
    specification_name: str
    specification_value: str


class ComparisonResponse(BaseModel):
    product_id: int
    current_listing_id: int | None
    seller_specifications: list[SpecificationMedian]
    seller_modes: list[SpecificationMode]
    manufacturer_specifications: list[ManufacturerSpecification]