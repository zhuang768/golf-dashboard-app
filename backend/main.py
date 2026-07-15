from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from analyzer import analyze_videos
import os
import shutil

app = FastAPI()

# Allow CORS for local frontend testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to actual frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("temp_uploads", exist_ok=True)

@app.post("/analyze")
async def process_swing(
    front_video: UploadFile = File(...),
    side_video: UploadFile = File(...),
    club_type: str = Form("7 Iron")
):
    """
    Endpoint to receive two video files, process them through the AI CV pipeline,
    and return the calculated golf metrics.
    """
    front_path = f"temp_uploads/{front_video.filename}"
    side_path = f"temp_uploads/{side_video.filename}"
    
    # Save the uploaded files temporarily
    with open(front_path, "wb") as f_front:
        shutil.copyfileobj(front_video.file, f_front)
        
    with open(side_path, "wb") as f_side:
        shutil.copyfileobj(side_video.file, f_side)
        
    try:
        # Run the computer vision analysis
        metrics = analyze_videos(front_path, side_path, club_type)
    finally:
        # Cleanup temporary files
        if os.path.exists(front_path):
            os.remove(front_path)
        if os.path.exists(side_path):
            os.remove(side_path)

    return {"status": "success", "data": metrics}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

