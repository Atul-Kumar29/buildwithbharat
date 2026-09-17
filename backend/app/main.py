from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Product Comparison API")

# Allow Next.js frontend to call this API
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


@app.get("/api/products")
def get_products():
    return {
        "products": [
            {
                "id": 1,
                "name": "Dell Inspiron 15",
                "seller": "Seller A",
                "price": 55000,
                "specifications": {
                    "RAM": "8 GB",
                    "Storage": "512 GB SSD",
                    "Display": "15.6 inch"
                }
            },
            {
                "id": 2,
                "name": "HP Pavilion 15",
                "seller": "Seller B",
                "price": 62000,
                "specifications": {
                    "RAM": "16 GB",
                    "Storage": "512 GB SSD",
                    "Display": "15.6 inch"
                }
            }
        ]
    }