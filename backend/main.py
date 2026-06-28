from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import init_db, close_db
from routers.auth import router as auth_router
from routers.setup import router as setup_router
from routers.organisation import router as organisation_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_db()


app = FastAPI(title="Ziyafat API", version="1.0.0", lifespan=lifespan)

# TODO: restrict allow_origins, allow_methods, allow_headers before prod deploy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(setup_router)
app.include_router(organisation_router)
