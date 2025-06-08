# backend/app/crud/crud_user.py
from typing import Any, Dict, Optional, Union, List
from uuid import UUID

from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder

from app.crud.base import CRUDBase
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserUpdateByAdmin
from app.core.security import get_password_hash # Untuk hashing password

class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        """Mengambil pengguna berdasarkan alamat email."""
        return db.query(User).filter(User.email == email).first()

    def get_by_username(self, db: Session, *, username: str) -> Optional[User]:
        """Mengambil pengguna berdasarkan username."""
        return db.query(User).filter(User.username == username).first()

    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        """
        Membuat pengguna baru.
        Password akan di-hash sebelum disimpan.
        """
        db_obj = User(
            email=obj_in.email,
            username=obj_in.username,
            hashed_password=get_password_hash(obj_in.password),
            full_name=obj_in.full_name,
            role=obj_in.role,
            is_active=obj_in.is_active if obj_in.is_active is not None else True,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[User]:
        """Mengambil beberapa pengguna dengan paginasi."""
        return db.query(self.model).order_by(self.model.full_name).offset(skip).limit(limit).all()

    def update(
        self,
        db: Session,
        *,
        db_obj: User,
        obj_in: Union[UserUpdate, UserUpdateByAdmin, Dict[str, Any]]
    ) -> User:
        """
        Memperbarui pengguna.
        Jika password ada di obj_in, password akan di-hash.
        """
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        
        if "password" in update_data and update_data["password"]:
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"] # Hapus password teks biasa
            update_data["hashed_password"] = hashed_password # Tambahkan hashed password

        return super().update(db, db_obj=db_obj, obj_in=update_data)

    def is_active(self, user: User) -> bool:
        """Memeriksa apakah pengguna aktif."""
        return user.is_active

    # Fungsi authenticate bisa tetap di endpoint auth, atau dipindahkan ke sini jika preferensi.
    # Untuk saat ini, endpoint auth bisa memanggil get_by_username dan verify_password secara terpisah.

user = CRUDUser(User)