# backend/app/schemas/bulk_upload.py

from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class UploadErrorDetail(BaseModel):
    """
    Detail error untuk satu baris yang gagal di-upload.
    """
    row_number: int
    error_message: str
    row_data: Optional[Dict[str, Any]] = None

class BulkUploadResponse(BaseModel):
    """
    Skema respons untuk operasi bulk upload.
    """
    total_processed: int
    successfully_created: int
    errors: List[UploadErrorDetail]
