from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path

app = FastAPI()

FRONTEND_DIR = Path("./+frontend")


@app.get("/")
async def read_root():
    return FileResponse(FRONTEND_DIR / "index.html")

app.mount("/", StaticFiles(directory=FRONTEND_DIR), name="frontend")
