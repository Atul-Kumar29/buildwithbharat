"""seed approved electronics categories

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "c3d4e5f6a7b8"
down_revision: Union[str, Sequence[str], None] = "b2c3d4e5f6a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    categories = (
        "Laptop", "GPU", "Earphone", "Mobile", "Mobiles", "Tablet", "CPU", "Monitor",
        "Keyboard", "Mouse", "Headphones", "Smartwatch", "Camera", "Router",
        "Printer", "Television", "Storage",
    )
    for category in categories:
        op.execute(sa.text("INSERT INTO categories (name) VALUES (:name) ON CONFLICT (name) DO NOTHING").bindparams(name=category))


def downgrade() -> None:
    op.execute("DELETE FROM categories WHERE lower(name) IN ('laptop', 'gpu', 'earphone', 'mobile', 'mobiles', 'tablet', 'cpu', 'monitor', 'keyboard', 'mouse', 'headphones', 'smartwatch', 'camera', 'router', 'printer', 'television', 'storage')")