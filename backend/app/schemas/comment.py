# backend/app/schemas/comment.py

from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime
from .user import UserRead # Untuk menampilkan detail pemilik komentar

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class CommentUpdate(CommentBase):
    pass

class CommentRead(CommentBase):
    id: UUID
    owner_id: UUID
    question_id: UUID
    created_at: datetime
    updated_at: datetime
    owner: UserRead # Tampilkan detail pengguna yang memberikan komentar

    model_config = ConfigDict(from_attributes=True)