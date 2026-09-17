"""add product catalog entities

Revision ID: 7b7d52a3f6c1
Revises: 52ea440b56c1
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "7b7d52a3f6c1"
down_revision: Union[str, Sequence[str], None] = "52ea440b56c1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "categories",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index("ix_categories_id", "categories", ["id"], unique=False)

    op.add_column("products", sa.Column("category_id", sa.Integer(), nullable=True))
    op.create_index("ix_products_category_id", "products", ["category_id"], unique=False)

    op.execute(
        """
        INSERT INTO categories (name)
        SELECT DISTINCT category FROM products
        WHERE category IS NOT NULL
        ON CONFLICT (name) DO NOTHING
        """
    )
    op.execute(
        """
        UPDATE products
        SET category_id = categories.id
        FROM categories
        WHERE products.category = categories.name
        """
    )
    op.drop_column("products", "category")
    op.create_foreign_key(
        "fk_products_category_id_categories",
        "products",
        "categories",
        ["category_id"],
        ["id"],
    )

    op.create_table(
        "sources",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("source_type", sa.String(length=50), nullable=False),
        sa.Column("url", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_sources_id", "sources", ["id"], unique=False)

    op.create_table(
        "listings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("source_id", sa.Integer(), nullable=True),
        sa.Column("source", sa.String(length=100), nullable=False),
        sa.Column("seller_name", sa.String(length=255), nullable=True),
        sa.Column("listing_url", sa.Text(), nullable=True),
        sa.Column("title", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.ForeignKeyConstraint(["source_id"], ["sources.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_listings_id", "listings", ["id"], unique=False)
    op.create_index("ix_listings_product_id", "listings", ["product_id"], unique=False)
    op.create_index("ix_listings_source_id", "listings", ["source_id"], unique=False)

    op.create_table(
        "product_specifications",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("specification_name", sa.String(length=100), nullable=False),
        sa.Column("specification_value", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_product_specifications_id", "product_specifications", ["id"], unique=False)
    op.create_index("ix_product_specifications_product_id", "product_specifications", ["product_id"], unique=False)

    op.create_table(
        "listing_specifications",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("listing_id", sa.Integer(), nullable=False),
        sa.Column("specification_name", sa.String(length=100), nullable=False),
        sa.Column("specification_value", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["listing_id"], ["listings.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_listing_specifications_id", "listing_specifications", ["id"], unique=False)
    op.create_index("ix_listing_specifications_listing_id", "listing_specifications", ["listing_id"], unique=False)


def downgrade() -> None:
    op.drop_table("listing_specifications")
    op.drop_table("product_specifications")
    op.drop_table("listings")
    op.drop_table("sources")
    op.drop_constraint("fk_products_category_id_categories", "products", type_="foreignkey")
    op.add_column("products", sa.Column("category", sa.String(length=100), nullable=True))
    op.execute(
        """
        UPDATE products
        SET category = categories.name
        FROM categories
        WHERE products.category_id = categories.id
        """
    )
    op.drop_index("ix_products_category_id", table_name="products")
    op.drop_column("products", "category_id")
    op.drop_index("ix_categories_id", table_name="categories")
    op.drop_table("categories")