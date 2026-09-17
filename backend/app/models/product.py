from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.category import Category
    from app.models.listing import Listing
    from app.models.specification import ProductSpecification


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    asin: Mapped[str | None] = mapped_column(String(20), unique=True, nullable=True)
    brand: Mapped[str | None] = mapped_column(String(100), nullable=True)
    category_id: Mapped[int | None] = mapped_column(ForeignKey("categories.id"), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    category: Mapped["Category | None"] = relationship(back_populates="products")
    listings: Mapped[list["Listing"]] = relationship(
        back_populates="product",
        cascade="all, delete-orphan"
    )
    specifications: Mapped[list["ProductSpecification"]] = relationship(
        back_populates="product",
        cascade="all, delete-orphan"
    )

    