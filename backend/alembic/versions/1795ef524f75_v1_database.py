"""V1 Database

Revision ID: 1795ef524f75
Revises: 3d41a53176c9
Create Date: 2025-06-08 23:45:43.682929

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1795ef524f75'
down_revision: Union[str, None] = '3d41a53176c9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
