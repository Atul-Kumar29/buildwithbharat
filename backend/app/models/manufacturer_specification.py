from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ManufacturerSpecification(Base):
    __tablename__ = "manufacturer_specifications"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"),
        index=True,
    )
    specification_name: Mapped[str] = mapped_column(String(255))
    specification_value: Mapped[str] = mapped_column(Text)

    product = relationship("Product", back_populates="manufacturer_specifications")