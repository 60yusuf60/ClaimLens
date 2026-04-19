import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

async def upload_photo(image_bytes: bytes, claim_id: str, file_index: int, mime_type: str) -> str:
    extension = mime_type.split("/")[-1]
    file_path = f"{claim_id}/photo_{file_index}.{extension}"
    
    supabase.storage.from_("claim-photos").upload(
        path=file_path,
        file=image_bytes,
        file_options={"content-type": mime_type}
    )
    
    return file_path