from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.products import router as products_router
from app.api.categories import router as categories_router
from app.api.listings import router as listings_router
from app.api.specifications import router as specifications_router

app = FastAPI(title="Product Comparison API")

# Allow Next.js frontend to call this API
app.include_router(products_router)
app.include_router(categories_router)
app.include_router(listings_router)
app.include_router(specifications_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Backend is connected and running"
    }

