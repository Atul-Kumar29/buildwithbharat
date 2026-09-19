from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.products import router as products_router
from app.api.categories import router as categories_router
from app.api.listings import router as listings_router
from app.api.specifications import router as specifications_router
from app.api.comparison import router as comparison_router
from app.api.auth import router as auth_router
from app.api.cart import router as cart_router
from app.api.reviews import router as reviews_router
from app.api.orders import router as orders_router
from app.api import search

app = FastAPI(title="Product Comparison API")

# Allow Next.js frontend to call this API
app.include_router(search.router)
app.include_router(auth_router)
app.include_router(cart_router)
app.include_router(reviews_router)
app.include_router(orders_router)
app.include_router(products_router)
app.include_router(categories_router)
app.include_router(listings_router)
app.include_router(specifications_router)
app.include_router(comparison_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Backend is connected and running"
    }

