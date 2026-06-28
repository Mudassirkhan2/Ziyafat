from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import init_db, close_db
from routers.auth import router as auth_router
from routers.setup import router as setup_router
from routers.organisation import router as organisation_router
from routers.users import router as users_router
from routers.leads import router as leads_router
from routers.customers import router as customers_router
from routers.bookings import router as bookings_router
from routers.events import router as events_router
from routers.dishes import router as dishes_router
from routers.quotations import router as quotations_router
from routers.invoices import router as invoices_router
from routers.storefront import router as storefront_router
from routers.ingredients import router as ingredients_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_db()


app = FastAPI(title="Ziyafat API", version="1.0.0", lifespan=lifespan)

# TODO: restrict allow_origins, allow_methods, allow_headers before prod deploy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(setup_router)
app.include_router(organisation_router)
app.include_router(users_router)
app.include_router(leads_router)
app.include_router(customers_router)
app.include_router(bookings_router)
app.include_router(events_router)
app.include_router(dishes_router)
app.include_router(quotations_router)
app.include_router(invoices_router)
app.include_router(storefront_router)
app.include_router(ingredients_router)
