# AmazonCompare

> **AmazonCompare** is a product-information comparison platform that helps users evaluate an online product listing by comparing the current seller's information with manufacturer-provided information and the specifications most frequently listed by other sellers.

---

## Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. Problem Statement](#2-problem-statement)
- [3. Proposed Solution](#3-proposed-solution)
- [4. Core Product Concept](#4-core-product-concept)
- [5. Key Features](#5-key-features)
- [6. System Architecture](#6-system-architecture)
- [7. High-Level Architecture](#7-high-level-architecture)
- [8. Request Lifecycle](#8-request-lifecycle)
- [9. Product Comparison Flow](#9-product-comparison-flow)
- [10. Data Flow](#10-data-flow)
- [11. Technology Stack](#11-technology-stack)
- [12. Repository Structure](#12-repository-structure)
- [13. Frontend Architecture](#13-frontend-architecture)
- [14. Backend Architecture](#14-backend-architecture)
- [15. Database Architecture](#15-database-architecture)
- [16. Database Schema](#16-database-schema)
- [17. Product Data Model](#17-product-data-model)
- [18. Seller Data Model](#18-seller-data-model)
- [19. Manufacturer Data](#19-manufacturer-data)
- [20. Specification Data](#20-specification-data)
- [21. Product Matching](#21-product-matching)
- [22. Data Normalization](#22-data-normalization)
- [23. Mode-Based Seller Aggregation](#23-mode-based-seller-aggregation)
- [24. Comparison Logic](#24-comparison-logic)
- [25. Missing and Conflicting Data](#25-missing-and-conflicting-data)
- [26. REST API](#26-rest-api)
- [27. API Endpoints](#27-api-endpoints)
- [28. API Error Handling](#28-api-error-handling)
- [29. Frontend-Backend Communication](#29-frontend-backend-communication)
- [30. Local Development Environment](#30-local-development-environment)
- [31. Local PostgreSQL and AWS RDS](#31-local-postgresql-and-aws-rds)
- [32. Environment Configuration](#32-environment-configuration)
- [33. Backend Setup](#33-backend-setup)
- [34. Frontend Setup](#34-frontend-setup)
- [35. Database Setup](#35-database-setup)
- [36. Database Migrations](#36-database-migrations)
- [37. Running the Application](#37-running-the-application)
- [38. API Testing](#38-api-testing)
- [39. Caching Strategy](#39-caching-strategy)
- [40. Scalability](#40-scalability)
- [41. AWS Deployment Architecture](#41-aws-deployment-architecture)
- [42. Security](#42-security)
- [43. Performance Considerations](#43-performance-considerations)
- [44. Data Consistency](#44-data-consistency)
- [45. Error Handling Strategy](#45-error-handling-strategy)
- [46. Testing Strategy](#46-testing-strategy)
- [47. Git and Development Workflow](#47-git-and-development-workflow)
- [48. Development Guidelines](#48-development-guidelines)
- [49. Design Decisions](#49-design-decisions)
- [50. Limitations](#50-limitations)
- [51. Future Improvements](#51-future-improvements)
- [52. Current Project Status](#52-current-project-status)
- [53. FAQ](#53-faq)
- [54. Contributors](#54-contributors)
- [55. License](#55-license)

---

# 1. Project Overview

AmazonCompare is designed to make product specifications on online marketplaces easier to evaluate.

A typical marketplace product page primarily presents information associated with the current listing. However, the same underlying product may be listed by multiple sellers, and the specifications reported by those sellers may not always be identical.

AmazonCompare addresses this by keeping different information sources separate and presenting them side by side.

For a product, the system can compare:

1. **Current Seller Information**
2. **Manufacturer Information**
3. **Most Frequently Listed Information Among Other Sellers**

The third category is calculated using the **mode** of the specifications reported by other sellers.

The objective is not to automatically declare one source correct. Instead, the system provides additional context so that users can see how the current listing compares with manufacturer information and the broader set of seller-provided information.

---

# 2. Problem Statement

Online marketplaces contain a large amount of product information, but product specifications can vary between listings.

Different sellers may list different values for:

- Weight
- Dimensions
- Screen size
- RAM
- Storage
- Battery capacity
- Processor
- Material
- Capacity
- Included accessories
- Other technical specifications

For example, five sellers may list the storage of the same product as:

```text
512 GB
512 GB
1 TB
512 GB
512 GB
```

A user looking at only one listing may never know that four other sellers report the same specification.

AmazonCompare provides a way to expose this information.

Instead of showing only one seller's value, the platform can show:

```text
Current Seller
        |
        +------------------+
                           |
Manufacturer               | Comparison
        |                  |
        +------------------+
                           |
Other Sellers ------------+
        |
        v
Most Frequently Listed Value
```

---

# 3. Proposed Solution

AmazonCompare introduces a comparison layer between raw product information and the user.

The system collects or stores information from multiple sources, associates those sources with the same underlying product, normalizes comparable specifications, and determines the most frequently listed specification among other sellers.

The high-level process is:

```mermaid
flowchart LR
    A["Product Listing"] --> B["Identify Product"]
    B --> C["Collect / Retrieve Sources"]

    C --> D["Current Seller"]
    C --> E["Manufacturer"]
    C --> F["Other Sellers"]

    D --> G["Normalize Data"]
    E --> G
    F --> G

    G --> H["Compare Specifications"]

    F --> I["Count Seller Values"]
    I --> J["Determine Mode"]

    J --> H

    H --> K["Comparison Response"]
    K --> L["Next.js UI"]
```

---

# 4. Core Product Concept

The core concept is to preserve the distinction between information sources.

```mermaid
flowchart TB
    P["Underlying Product"]

    P --> CS["Current Seller Listing"]
    P --> M["Manufacturer Information"]
    P --> OS["Other Seller Listings"]

    OS --> A["Aggregate Seller Specifications"]
    A --> MODE["Most Frequently Listed Value (Mode)"]

    CS --> C["Comparison"]
    M --> C
    MODE --> C

    C --> UI["Comparison Tables"]
```

The frontend can therefore show information such as:

| Specification | Current Seller | Manufacturer | Other Sellers — Most Frequently Listed |
|---|---|---|---|
| RAM | 16 GB | 16 GB | 16 GB |
| Weight | 1.6 kg | 1.4 kg | 1.5 kg |
| Storage | 1 TB | 1 TB | 512 GB |
| Display | 15.6 inch | 15.6 inch | 15.6 inch |

The system does not need to decide which value the user should believe. It exposes the differences between the sources.

---

# 5. Key Features

## 5.1 Product Management

The backend supports product records and basic CRUD operations.

Typical operations include:

- Create a product
- Retrieve a product
- Retrieve multiple products
- Update a product
- Delete a product
- Return appropriate errors when a product does not exist

---

## 5.2 Seller Information

A product can have information associated with multiple sellers.

Seller information is retained separately so that individual seller observations can be aggregated later.

---

## 5.3 Manufacturer Information

Manufacturer-provided information is maintained separately from seller-provided information.

This allows the application to distinguish:

```text
Manufacturer specification
            !=
Seller specification
```

---

## 5.4 Specification Comparison

The application can compare the same specification across:

- Current seller
- Manufacturer
- Other sellers

---

## 5.5 Mode-Based Seller Aggregation

For specifications where multiple sellers provide comparable values, the application determines the **mode**.

The mode is the value that occurs most frequently in the available seller data.

Example:

```text
Seller A: 512 GB
Seller B: 512 GB
Seller C: 1 TB
Seller D: 512 GB
Seller E: 256 GB
```

Frequency:

```text
512 GB -> 3
1 TB   -> 1
256 GB -> 1
```

Therefore:

```text
Mode = 512 GB
```

This represents the **most frequently listed specification**, which is the intended aggregation shown to the user.

---

## 5.6 REST API

The backend exposes HTTP APIs that the Next.js frontend consumes.

The frontend does not directly access PostgreSQL.

```mermaid
flowchart LR
    Browser["Browser"] --> Frontend["Next.js"]
    Frontend --> API["FastAPI REST API"]
    API --> DB[("PostgreSQL")]
```

---

# 6. System Architecture

AmazonCompare follows a layered architecture.

```mermaid
flowchart TB

    subgraph Presentation["Presentation Layer"]
        Next["Next.js / React"]
        UI["Product and Comparison UI"]
    end

    subgraph Application["Application Layer"]
        API["FastAPI"]
        Routes["API Routes"]
        Logic["Business / Comparison Logic"]
        Validation["Pydantic Validation"]
    end

    subgraph DataAccess["Data Access Layer"]
        ORM["SQLAlchemy"]
    end

    subgraph Database["Database Layer"]
        PostgreSQL[("PostgreSQL")]
    end

    Next --> UI
    UI --> API
    API --> Routes
    Routes --> Validation
    Routes --> Logic
    Logic --> ORM
    ORM --> PostgreSQL
```

The responsibilities of the layers are intentionally separated.

---

# 7. High-Level Architecture

The complete system can be represented as follows:

```mermaid
flowchart TB

    User["User"]

    subgraph Client["Client"]
        Browser["Web Browser"]
        Next["Next.js Frontend"]
    end

    subgraph Backend["Backend"]
        FastAPI["FastAPI Application"]
        ProductRoutes["Product Routes"]
        ComparisonRoutes["Comparison Routes"]
        Services["Business / Comparison Services"]
        ORM["SQLAlchemy ORM"]
    end

    subgraph Storage["Data Storage"]
        PostgreSQL[("PostgreSQL")]
    end

    subgraph Optional["Optional Scalability Components"]
        Cache[("Redis Cache")]
    end

    User --> Browser
    Browser --> Next

    Next --> ProductRoutes
    Next --> ComparisonRoutes

    ProductRoutes --> FastAPI
    ComparisonRoutes --> FastAPI

    FastAPI --> Services

    Services --> Cache
    Services --> ORM

    ORM --> PostgreSQL
```

---

# 8. Request Lifecycle

A normal product request travels through the system as follows:

```mermaid
sequenceDiagram
    participant U as User
    participant F as Next.js
    participant B as FastAPI
    participant S as Service Layer
    participant D as PostgreSQL

    U->>F: Open product
    F->>B: HTTP request
    B->>S: Validate and process request
    S->>D: Query product data
    D-->>S: Product and related records
    S->>S: Build comparison
    S-->>B: Comparison result
    B-->>F: JSON response
    F-->>U: Render product comparison
```

---

# 9. Product Comparison Flow

The comparison process is one of the most important parts of the application.

```mermaid
flowchart TD

    Start["Product Requested"]

    Identify["Identify Underlying Product"]

    Current["Retrieve Current Seller"]
    Manufacturer["Retrieve Manufacturer Information"]
    Sellers["Retrieve Other Seller Listings"]

    Normalize["Normalize Comparable Specifications"]

    Group["Group Seller Values by Specification"]

    Count["Count Frequency of Each Value"]

    Mode["Determine Most Frequently Listed Value"]

    Compare["Build Comparison"]

    Response["Return Comparison JSON"]

    Display["Display Separate Comparison Tables"]

    Start --> Identify

    Identify --> Current
    Identify --> Manufacturer
    Identify --> Sellers

    Current --> Normalize
    Manufacturer --> Normalize
    Sellers --> Normalize

    Normalize --> Group
    Group --> Count
    Count --> Mode

    Normalize --> Compare
    Mode --> Compare
    Current --> Compare
    Manufacturer --> Compare

    Compare --> Response
    Response --> Display
```

---

# 10. Data Flow

The complete data flow can be summarized as:

```mermaid
flowchart LR

    Sources["Product Information Sources"]

    Product["Product Identity"]

    Raw["Raw Seller / Manufacturer Data"]

    Normalize["Normalization"]

    Store[("PostgreSQL")]

    Retrieve["Retrieve Related Data"]

    Aggregate["Seller Aggregation"]

    Compare["Comparison"]

    API["FastAPI Response"]

    UI["Next.js UI"]

    Sources --> Product
    Product --> Raw
    Raw --> Normalize
    Normalize --> Store

    Store --> Retrieve
    Retrieve --> Aggregate
    Retrieve --> Compare
    Aggregate --> Compare

    Compare --> API
    API --> UI
```

---

# 11. Technology Stack

## Frontend

| Technology | Purpose |
|---|---|
| Next.js | Frontend framework |
| React | UI components |
| JavaScript / TypeScript | Application development |
| CSS | Styling |
| HTTP / Fetch | Backend communication |

---

## Backend

| Technology | Purpose |
|---|---|
| Python | Backend language |
| FastAPI | REST API framework |
| Uvicorn | ASGI server |
| SQLAlchemy | ORM / database access |
| Pydantic | Request and response validation |

---

## Database

| Technology | Purpose |
|---|---|
| PostgreSQL | Relational database |
| SQLAlchemy | Database abstraction |
| Alembic | Schema migrations |

---

## Cloud

The production architecture is intended to use AWS infrastructure, with Amazon RDS PostgreSQL serving as the production relational database.

Additional AWS components can be introduced as deployment requirements evolve.

---

# 12. Repository Structure

The repository is organized into separate frontend and backend applications.

```text
buildwithbharat/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routes/
│   │   ├── services/
│   │   └── database/
│   │
│   ├── alembic/
│   ├── requirements.txt
│   ├── .env
│   └── ...
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── .gitignore
├── README.md
└── ...
```

> The exact internal directory structure can evolve during development. The important architectural boundary is the separation between the Next.js frontend, FastAPI backend, and PostgreSQL database.

---

# 13. Frontend Architecture

The frontend is responsible for presentation and user interaction.

Responsibilities include:

- Product pages
- Product search / selection
- Comparison tables
- Current seller information
- Manufacturer information
- Most frequently listed seller specifications
- Loading states
- Error states
- API communication

The frontend should not directly access the database.

```mermaid
flowchart TB

    User["User"]

    Pages["Next.js Pages / Routes"]

    Components["Reusable React Components"]

    APIClient["API Client"]

    Backend["FastAPI"]

    User --> Pages
    Pages --> Components
    Components --> APIClient
    APIClient --> Backend
```

---

# 14. Backend Architecture

FastAPI acts as the application boundary between the frontend and database.

Responsibilities include:

- HTTP routing
- Request validation
- Response serialization
- Product CRUD
- Seller data retrieval
- Manufacturer data retrieval
- Comparison logic
- Seller-value aggregation
- Error handling
- Database interaction

```mermaid
flowchart TB

    Request["HTTP Request"]

    Router["FastAPI Router"]

    Validation["Request Validation"]

    Service["Business Logic / Service Layer"]

    Comparison["Comparison Engine"]

    Repository["Database Access"]

    DB[("PostgreSQL")]

    Request --> Router
    Router --> Validation
    Validation --> Service

    Service --> Comparison
    Service --> Repository

    Comparison --> Repository
    Repository --> DB
```

---

# 15. Database Architecture

PostgreSQL is the primary relational data store.

The database maintains relationships between:

- Products
- Sellers
- Seller listings
- Seller specifications
- Manufacturer information
- Manufacturer specifications

Conceptually:

```mermaid
flowchart TB

    Product[("Product")]

    Seller[("Seller")]

    SellerListing[("Seller Product / Listing")]

    SellerSpec[("Seller Specification")]

    Manufacturer[("Manufacturer Product")]

    ManufacturerSpec[("Manufacturer Specification")]

    Product --> SellerListing
    Seller --> SellerListing
    SellerListing --> SellerSpec

    Product --> Manufacturer
    Manufacturer --> ManufacturerSpec
```

---

# 16. Database Schema

The following represents the conceptual relational model.

```mermaid
erDiagram

    PRODUCT ||--o{ SELLER_PRODUCT : "has listings"
    SELLER ||--o{ SELLER_PRODUCT : "lists"
    SELLER_PRODUCT ||--o{ SELLER_SPECIFICATION : "contains"

    PRODUCT ||--o| MANUFACTURER_PRODUCT : "has"
    MANUFACTURER_PRODUCT ||--o{ MANUFACTURER_SPECIFICATION : "contains"

    PRODUCT {
        int id PK
        string name
        string identifier
    }

    SELLER {
        int id PK
        string name
    }

    SELLER_PRODUCT {
        int id PK
        int product_id FK
        int seller_id FK
    }

    SELLER_SPECIFICATION {
        int id PK
        int seller_product_id FK
        string specification
        string value
        string unit
    }

    MANUFACTURER_PRODUCT {
        int id PK
        int product_id FK
        string manufacturer
    }

    MANUFACTURER_SPECIFICATION {
        int id PK
        int manufacturer_product_id FK
        string specification
        string value
        string unit
    }
```

> The exact production schema may evolve as implementation progresses. The important principle is that source-specific information remains distinguishable.

---

# 17. Product Data Model

A product represents the underlying product being compared.

A conceptual product record may contain:

| Field | Description |
|---|---|
| `id` | Internal primary key |
| `name` | Product name |
| `identifier` | Product identifier used for matching |
| Other metadata | Category or additional identifying information |

The product is the entity that connects multiple seller listings and manufacturer information.

```mermaid
flowchart TB

    Product["Product"]

    Product --> SellerA["Seller A Listing"]
    Product --> SellerB["Seller B Listing"]
    Product --> SellerC["Seller C Listing"]

    Product --> Manufacturer["Manufacturer Information"]
```

---

# 18. Seller Data Model

A seller represents a marketplace seller.

A seller can list multiple products.

```mermaid
flowchart TB

    Seller["Seller"]

    Seller --> Listing1["Product Listing A"]
    Seller --> Listing2["Product Listing B"]
    Seller --> Listing3["Product Listing C"]
```

A seller listing connects a seller to a specific underlying product.

This allows the system to distinguish:

```text
Seller
    |
    +-- Seller's listing of Product X
    |
    +-- Seller's listing of Product Y
```

---

# 19. Manufacturer Data

Manufacturer information is treated as a separate source.

This distinction is essential because the manufacturer and marketplace sellers have different relationships with the product.

Example:

```text
Manufacturer:
Weight = 1.4 kg

Seller A:
Weight = 1.5 kg

Seller B:
Weight = 1.5 kg

Seller C:
Weight = 1.6 kg
```

The system should preserve all three categories rather than merging them into a single `weight` field.

```mermaid
flowchart LR

    Product["Product"]

    Product --> Manufacturer["Manufacturer Source"]
    Product --> Current["Current Seller Source"]
    Product --> Others["Other Seller Sources"]

    Manufacturer --> M["Manufacturer Value"]
    Current --> C["Current Seller Value"]
    Others --> O["Other Seller Values"]
```

---

# 20. Specification Data

Specifications should be represented in a way that allows different types of products to be supported.

Examples include:

```text
Weight
RAM
Storage
Screen Size
Battery Capacity
Dimensions
Processor
Material
Capacity
```

A specification can conceptually consist of:

```text
Specification Name
Specification Value
Unit
Source
```

For example:

| Specification | Value | Unit | Source |
|---|---:|---|---|
| Weight | 1.5 | kg | Seller |
| RAM | 16 | GB | Seller |
| Screen Size | 15.6 | inch | Manufacturer |

---

# 21. Product Matching

Product matching is critical because seller listings need to be associated with the correct underlying product.

Different sellers may describe the same product differently.

For example:

```text
"Example Laptop M3 13-inch"
"Example 13 Laptop M3"
"Example Laptop 13 M3"
```

These may represent the same product.

However, similar names can also refer to different:

- Generations
- Configurations
- Storage capacities
- Regional versions
- Bundles
- Variants

Therefore, product identity should be based on stable identifiers wherever possible.

```mermaid
flowchart TD

    ListingA["Seller Listing A"]
    ListingB["Seller Listing B"]
    ListingC["Seller Listing C"]

    Identifier["Product Identifier / Matching Logic"]

    Product["Underlying Product"]

    ListingA --> Identifier
    ListingB --> Identifier
    ListingC --> Identifier

    Identifier --> Product
```

---

# 22. Data Normalization

Before comparing specifications, values need to be normalized where necessary.

For example:

```text
1.5 kg
1500 g
```

represent the same physical quantity.

Similarly:

```text
15.6 inch
15.6 inches
```

should be treated consistently.

The normalization process can be represented as:

```mermaid
flowchart LR

    Raw["Raw Specification"]

    Parse["Parse Name / Value / Unit"]

    Convert["Normalize Unit / Format"]

    Standard["Canonical Representation"]

    Raw --> Parse
    Parse --> Convert
    Convert --> Standard
```

Normalization should happen before frequency counting.

---

# 23. Mode-Based Seller Aggregation

The seller comparison value is based on the **mode**, not the median.

The mode is the value that appears most frequently among the available seller listings for a given specification.

## Example

Suppose the seller listings contain:

```text
Seller A -> 512 GB
Seller B -> 512 GB
Seller C -> 1 TB
Seller D -> 512 GB
Seller E -> 256 GB
```

Frequency:

```text
512 GB -> 3
1 TB   -> 1
256 GB -> 1
```

Therefore:

```text
Most Frequently Listed Value = 512 GB
```

The process is:

```mermaid
flowchart TD

    Values["Seller Specification Values"]

    Normalize["Normalize Values"]

    Group["Group Identical Values"]

    Count["Count Occurrences"]

    Highest["Find Highest Frequency"]

    Mode["Mode / Most Frequently Listed Value"]

    Values --> Normalize
    Normalize --> Group
    Group --> Count
    Count --> Highest
    Highest --> Mode
```

---

## Why Mode?

The purpose of this aggregation is specifically to answer:

> **What specification do sellers most commonly list for this product?**

That makes mode a natural aggregation method.

It is different from asking:

> What is the numerical middle value?

That second question would require a median, but it is not the goal of this project.

---

## Example With Text Values

Mode is also useful for categorical specifications.

For example:

```text
Material:
Aluminium
Aluminium
Aluminium
Metal
Aluminium
```

Mode:

```text
Aluminium
```

A median would not make sense here.

This is one of the reasons mode is better aligned with the project's intended comparison.

---

# 24. Comparison Logic

The final comparison combines three sources:

```mermaid
flowchart LR

    Current["Current Seller"]

    Manufacturer["Manufacturer"]

    Sellers["Other Sellers"]

    Sellers --> Aggregate["Frequency Aggregation"]
    Aggregate --> Mode["Most Frequently Listed Value"]

    Current --> Comparison["Comparison Result"]
    Manufacturer --> Comparison
    Mode --> Comparison

    Comparison --> Response["API Response"]
```

The result can be represented as:

| Specification | Current Seller | Manufacturer | Other Sellers — Mode |
|---|---|---|---|
| Weight | 1.6 kg | 1.4 kg | 1.5 kg |
| RAM | 16 GB | 16 GB | 16 GB |
| Storage | 1 TB | 1 TB | 512 GB |

The frontend can then display these sources in separate tables or clearly separated sections.

---

# 25. Missing and Conflicting Data

Not every seller will provide every specification.

For example:

```text
Seller A:
Weight
RAM
Storage

Seller B:
Weight
RAM

Seller C:
Weight
Storage
```

The application should not interpret missing data as zero.

Instead, the mode should be calculated from the values that actually exist.

For RAM:

```text
Seller A -> 16 GB
Seller B -> 16 GB
Seller C -> missing
```

Mode:

```text
16 GB
```

The missing value from Seller C does not become `0 GB`.

---

## Conflicting Values

Suppose:

```text
Manufacturer -> 1.4 kg
Current Seller -> 1.6 kg

Other Sellers:
1.5 kg
1.5 kg
1.5 kg
1.6 kg
1.4 kg
```

The comparison should preserve the disagreement:

```text
Current Seller: 1.6 kg
Manufacturer:   1.4 kg
Seller Mode:    1.5 kg
```

The system should present the evidence rather than silently replacing one source with another.

---

# 26. REST API

The backend exposes REST-style HTTP endpoints.

Conceptually:

```text
/api
    /products
    /products/{id}
    /sellers
    /manufacturers
    /comparison
```

The API acts as the only application-facing gateway to the database.

```mermaid
flowchart LR

    Frontend["Next.js"]

    API["FastAPI"]

    Database[("PostgreSQL")]

    Frontend -->|"HTTP / JSON"| API
    API -->|"SQLAlchemy"| Database
```

---

# 27. API Endpoints

The exact API surface may expand as implementation continues, but the current product API follows standard CRUD conventions.

## Get Products

```http
GET /api/products
```

Returns a collection of products.

---

## Get Product

```http
GET /api/products/{product_id}
```

Returns one product.

---

## Create Product

```http
POST /api/products
```

Creates a new product.

Example:

```json
{
  "name": "Example Laptop",
  "manufacturer": "Example Manufacturer"
}
```

---

## Update Product

```http
PUT /api/products/{product_id}
```

Updates an existing product.

---

## Delete Product

```http
DELETE /api/products/{product_id}
```

Deletes a product.

If the product does not exist, the API returns a `404 Not Found`.

Example:

```json
{
  "detail": "Product not found"
}
```

---

# 28. API Error Handling

The backend uses appropriate HTTP status codes.

| Status Code | Meaning |
|---|---|
| `200 OK` | Successful request |
| `201 Created` | Resource created |
| `204 No Content` | Successful request without response body |
| `400 Bad Request` | Invalid request |
| `404 Not Found` | Requested resource does not exist |
| `422 Unprocessable Entity` | Validation failure |
| `500 Internal Server Error` | Unexpected server-side failure |

Example:

```http
DELETE /api/products/99999
```

Response:

```http
HTTP/1.1 404 Not Found
```

```json
{
  "detail": "Product not found"
}
```

This behavior ensures that API clients can distinguish a missing resource from a successful operation.

---

# 29. Frontend-Backend Communication

The frontend communicates with the backend using HTTP requests.

```mermaid
sequenceDiagram
    participant Browser as Browser
    participant Next as Next.js
    participant API as FastAPI
    participant DB as PostgreSQL

    Browser->>Next: Open product page
    Next->>API: GET /api/products/{id}
    API->>DB: Query product
    DB-->>API: Product data
    API-->>Next: JSON response
    Next-->>Browser: Render UI
```

The browser should never connect directly to PostgreSQL.

Correct:

```text
Browser -> Next.js -> FastAPI -> PostgreSQL
```

Incorrect:

```text
Browser -> PostgreSQL
```

---

# 30. Local Development Environment

During development, the application can run entirely on the developer's machine.

```mermaid
flowchart TB

    Browser["Web Browser"]

    Frontend["Next.js\nlocalhost:3000"]

    Backend["FastAPI\nlocalhost:8001"]

    Database[("PostgreSQL\nlocalhost:5432")]

    Browser --> Frontend
    Frontend --> Backend
    Backend --> Database
```

This provides an inexpensive and fast development environment.

---

# 31. Local PostgreSQL and AWS RDS

The development and production databases should use the same database engine and schema wherever possible.

### Local Development

```text
PostgreSQL
localhost
```

### Production

```text
Amazon RDS for PostgreSQL
```

The backend should not need different database logic for the two environments.

Only the connection configuration should change.

```mermaid
flowchart LR

    Backend["FastAPI"]

    Config["DATABASE_URL"]

    Local[("Local PostgreSQL")]
    RDS[("Amazon RDS PostgreSQL")]

    Backend --> Config

    Config --> Local
    Config --> RDS
```

---

# 32. Environment Configuration

Configuration should be supplied using environment variables.

Example backend `.env`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/buildwithbharat
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000
```

Production:

```env
DATABASE_URL=postgresql://username:password@rds-endpoint:5432/buildwithbharat
ENVIRONMENT=production
CORS_ORIGINS=https://your-domain.example
```

The exact production values should be supplied by the deployment environment.

---

## Secrets Must Not Be Committed

Never commit:

```text
.env
.env.local
database passwords
AWS credentials
API keys
private keys
```

Use environment variables or a proper secret-management system.

---

# 33. Backend Setup

Move into the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python3 -m venv venv
```

Activate it on Linux/macOS:

```bash
source venv/bin/activate
```

On Windows:

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn app.main:app --reload --port 8001
```

The API will normally be available at:

```text
http://127.0.0.1:8001
```

FastAPI's interactive documentation is available at:

```text
http://127.0.0.1:8001/docs
```

---

# 34. Frontend Setup

Move into the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:3000
```

---

# 35. Database Setup

PostgreSQL must be running before the backend attempts to connect to it.

Create the development database:

```sql
CREATE DATABASE buildwithbharat;
```

Then configure the backend:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/buildwithbharat
```

The application should use the same schema definition and migration history when connecting to another PostgreSQL environment.

---

# 36. Database Migrations

Database schema changes should be tracked through migrations.

The intended workflow is:

```mermaid
flowchart LR

    Models["SQLAlchemy Models"]

    Migration["Alembic Migration"]

    Database[("PostgreSQL")]

    Models --> Migration
    Migration --> Database
```

Example:

```bash
alembic revision --autogenerate -m "describe schema change"
```

Apply migrations:

```bash
alembic upgrade head
```

Migrations make it possible to reproduce the database schema across:

- Developer machines
- Testing environments
- Staging
- Production

---

# 37. Running the Application

The development environment requires:

1. PostgreSQL
2. FastAPI
3. Next.js

A typical local setup is:

```mermaid
flowchart LR

    DB[("PostgreSQL :5432")]
    API["FastAPI :8001"]
    FE["Next.js :3000"]
    Browser["Browser"]

    Browser --> FE
    FE --> API
    API --> DB
```

Start PostgreSQL first.

Then start FastAPI.

Then start Next.js.

Open the frontend in a browser.

---

# 38. API Testing

FastAPI provides interactive API documentation at:

```text
http://127.0.0.1:8001/docs
```

This can be used to test endpoints independently of the frontend.

---

## cURL

Get all products:

```bash
curl http://127.0.0.1:8001/api/products
```

Get a product:

```bash
curl http://127.0.0.1:8001/api/products/1
```

Delete a product:

```bash
curl -i -X DELETE \
  "http://127.0.0.1:8001/api/products/1"
```

Test a nonexistent product:

```bash
curl -i -X DELETE \
  "http://127.0.0.1:8001/api/products/99999"
```

Expected result:

```http
404 Not Found
```

with:

```json
{
  "detail": "Product not found"
}
```

---

# 39. Caching Strategy

Caching is useful when the same product comparison is requested repeatedly.

Without caching:

```mermaid
flowchart LR

    Users["Many Users"]

    API["FastAPI"]

    DB[("PostgreSQL")]

    Users --> API
    API --> DB
```

With caching:

```mermaid
flowchart LR

    Users["Many Users"]

    API["FastAPI"]

    Cache[("Redis")]

    DB[("PostgreSQL")]

    Users --> API
    API --> Cache

    Cache -->|"Cache Hit"| API
    Cache -->|"Cache Miss"| DB
    DB --> Cache
```

Product comparison results are potential cache candidates because the same product can be requested many times.

A conceptual cache key could be:

```text
product:{product_id}:comparison
```

The cache TTL should depend on how frequently the underlying product data changes.

Caching is an architectural extension rather than a requirement for the initial MVP.

---

# 40. Scalability

The system is designed so that application components can eventually scale independently.

A simple deployment:

```mermaid
flowchart TB

    User["Users"]

    Frontend["Frontend"]

    API["FastAPI"]

    DB[("PostgreSQL")]

    User --> Frontend
    Frontend --> API
    API --> DB
```

A scaled backend:

```mermaid
flowchart TB

    Users["Users"]

    LB["Load Balancer"]

    API1["FastAPI Instance 1"]
    API2["FastAPI Instance 2"]
    API3["FastAPI Instance 3"]

    Cache[("Redis")]
    DB[("PostgreSQL")]

    Users --> LB

    LB --> API1
    LB --> API2
    LB --> API3

    API1 --> Cache
    API2 --> Cache
    API3 --> Cache

    API1 --> DB
    API2 --> DB
    API3 --> DB
```

FastAPI instances should remain as stateless as possible so that additional instances can be added without requiring users to stay connected to a specific server.

---

# 41. AWS Deployment Architecture

A possible production architecture is:

```mermaid
flowchart TB

    User["Internet Users"]

    DNS["Domain / DNS"]

    Frontend["Next.js Hosting"]

    Backend["FastAPI Application"]

    RDS[("Amazon RDS\nPostgreSQL")]

    Cache[("Optional Redis / ElastiCache")]

    Monitoring["Logging / Monitoring"]

    User --> DNS
    DNS --> Frontend

    Frontend --> Backend

    Backend --> RDS
    Backend --> Cache

    Backend --> Monitoring
    RDS --> Monitoring
```

The exact AWS services used to host the frontend and backend can be chosen based on the final deployment requirements.

The important database principle is that the backend connects to Amazon RDS, while the browser never connects directly to RDS.

---

# 42. Security

## Database Credentials

Database credentials must remain server-side.

Never expose:

```text
DATABASE_URL
DB_PASSWORD
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

to the browser.

---

## CORS

Development may allow:

```text
http://localhost:3000
```

Production should restrict allowed origins to the deployed frontend domain.

---

## SQL Injection

Use SQLAlchemy's parameterized queries and ORM facilities.

Avoid constructing SQL by concatenating user input.

Bad:

```python
query = "SELECT * FROM products WHERE id = " + user_input
```

Prefer parameterized queries or SQLAlchemy ORM expressions.

---

## Input Validation

FastAPI and Pydantic should validate incoming request data before it reaches application logic.

---

# 43. Performance Considerations

Potential performance bottlenecks include:

- Large numbers of product listings
- Repeated product comparison requests
- Complex aggregation operations
- Database connection overhead
- Product matching
- Data normalization
- External data collection
- Large specification datasets

---

## Database Indexing

Frequently queried columns should be indexed where justified by actual query patterns.

Potential candidates include:

```text
product.id
product.identifier
seller.id
seller_product.product_id
seller_product.seller_id
```

Indexes should be based on query patterns rather than automatically adding indexes to every column.

---

# 44. Data Consistency

Data consistency is important because multiple entities are related.

For example:

```mermaid
flowchart LR

    Product["Product"]

    Listing["Seller Listing"]

    Seller["Seller"]

    Specification["Seller Specification"]

    Product --> Listing
    Seller --> Listing
    Listing --> Specification
```

Foreign keys should maintain these relationships.

The database should prevent invalid relationships wherever possible.

For example, a seller specification should not reference a nonexistent seller listing.

---

# 45. Error Handling Strategy

Errors should be handled at the appropriate layer.

```mermaid
flowchart TD

    Request["Incoming Request"]

    Validation["Validation"]

    Service["Business Logic"]

    Database["Database"]

    Response["HTTP Response"]

    Request --> Validation

    Validation -->|"Invalid"| Response
    Validation -->|"Valid"| Service

    Service --> Database

    Database -->|"Failure"| Response
    Database -->|"Success"| Service

    Service --> Response
```

Typical API behavior:

| Situation | Response |
|---|---|
| Valid request | `200` / `201` / appropriate success code |
| Invalid input | `400` / `422` |
| Missing product | `404` |
| Unexpected server error | `500` |

Errors returned to clients should be clear enough to understand what went wrong without exposing sensitive internal information.

---

# 46. Testing Strategy

Testing should happen at multiple levels.

## Unit Tests

Test individual business functions.

Examples:

- Mode calculation
- Unit normalization
- Specification matching
- Validation
- Product transformations

---

## API Tests

Test:

```text
GET /api/products
GET /api/products/{id}
POST /api/products
PUT /api/products/{id}
DELETE /api/products/{id}
```

Also test:

- Missing resources
- Invalid request bodies
- Invalid IDs
- Validation failures

---

## Database Tests

Verify:

- Table relationships
- Foreign keys
- Constraints
- Inserts
- Updates
- Deletes
- Migrations

---

## Integration Tests

Test the complete application path:

```mermaid
flowchart LR

    Frontend["Frontend"]

    API["FastAPI"]

    DB[("PostgreSQL")]

    Frontend --> API
    API --> DB
```

---

# 47. Git and Development Workflow

Development should happen through Git.

A typical branch structure could be:

```mermaid
gitGraph
    commit id: "Initial project"

    branch feature/backend
    checkout feature/backend
    commit id: "Backend changes"

    checkout main
    branch feature/frontend
    checkout feature/frontend
    commit id: "Frontend changes"

    checkout main
    merge feature/backend
    merge feature/frontend
    commit id: "Integrated MVP"
```

Branch names should describe the work being performed.

Examples:

```text
feature/product-api
feature/comparison-engine
feature/frontend-comparison
feature/database-schema
feature/aws-deployment
fix/product-delete
```

---

## Before Committing

Check the working tree:

```bash
git status
```

Inspect changes:

```bash
git diff
```

Run relevant tests.

Then:

```bash
git add .
git commit -m "Add product comparison API"
git push
```

---

# 48. Development Guidelines

## Keep Frontend and Backend Separate

Frontend responsibilities:

- UI
- User interaction
- API calls
- Presentation

Backend responsibilities:

- Business logic
- Validation
- Database operations
- Aggregation
- Comparison

---

## Keep Database Logic Out of React Components

Do not make frontend components responsible for database access.

Correct:

```mermaid
flowchart LR
    UI["React / Next.js"] --> API["FastAPI"] --> DB[("PostgreSQL")]
```

---

## Keep Comparison Logic in the Backend

The backend should own the definition of how seller specifications are:

- Normalized
- Grouped
- Counted
- Aggregated
- Returned

This prevents different clients from implementing different comparison rules.

---

## Preserve Source Information

Do not overwrite manufacturer information with seller information.

Likewise, do not overwrite the current seller's value with the seller mode.

All three should remain independently identifiable.

---

# 49. Design Decisions

## Why PostgreSQL?

PostgreSQL was selected because the application has structured relational data.

It provides:

- Relational modeling
- Foreign keys
- Constraints
- Transactions
- SQL querying
- Strong consistency
- Compatibility with SQLAlchemy
- Amazon RDS support

---

## Why FastAPI?

FastAPI provides:

- Python support
- Automatic OpenAPI documentation
- Pydantic validation
- High performance
- Straightforward REST API development
- Good integration with SQLAlchemy

---

## Why Next.js?

Next.js provides:

- React-based UI
- Routing
- Modern frontend tooling
- Production-ready application structure
- Easy API integration

---

## Why Separate Frontend and Backend?

The separation provides a clean architecture:

```mermaid
flowchart LR
    Frontend["Next.js"] -->|"HTTP / JSON"| Backend["FastAPI"]
    Backend -->|"SQLAlchemy"| Database[("PostgreSQL")]
```

This makes each component easier to develop, test, and deploy independently.

---

## Why Mode Instead of Median?

The project's goal is to identify:

> **The specification most frequently listed by other sellers.**

Mode directly answers that question.

For example:

```text
Seller A: 512 GB
Seller B: 512 GB
Seller C: 1 TB
Seller D: 512 GB
Seller E: 256 GB
```

The most frequently listed specification is:

```text
512 GB
```

Therefore:

```text
Seller Mode = 512 GB
```

Median would answer a different question and is also unsuitable for many categorical specifications.

---

## Why Keep Manufacturer Data Separate?

Manufacturer information has a different provenance from seller information.

Keeping it separate allows the user to see:

```text
Current Seller
Manufacturer
Other Seller Mode
```

without implying that these sources are interchangeable.

---

# 50. Limitations

## Mode Does Not Guarantee Correctness

The most frequently listed value is not necessarily the true value.

For example, if several sellers copy the same incorrect specification:

```text
Seller A -> Incorrect value
Seller B -> Incorrect value
Seller C -> Incorrect value
Seller D -> Correct value
```

the incorrect value may still become the mode.

Therefore:

> **Seller Mode is an observed marketplace consensus, not a guaranteed ground truth.**

---

## Manufacturer Information May Be Missing

Some products may not have accessible manufacturer specifications.

In such cases, the application should represent the information as unavailable rather than inventing a value.

---

## Seller Data May Be Incomplete

Different sellers may provide different subsets of specifications.

The system should aggregate only the values that are actually available.

---

## Product Matching Is Difficult

Two listings that look similar may refer to different variants.

Incorrect matching could result in invalid comparisons.

Product identification is therefore one of the most important data-quality considerations.

---

## Ties in Mode

A specification may have multiple equally frequent values.

For example:

```text
Seller A -> 16 GB
Seller B -> 16 GB
Seller C -> 32 GB
Seller D -> 32 GB
```

Both values occur twice.

The application must define how such ties are represented.

A safe approach is to preserve the tie instead of arbitrarily declaring one value the mode.

```mermaid
flowchart TD

    Values["Seller Values"]

    Count["Count Frequencies"]

    Tie{"Highest Frequency Shared?"}

    Single["Return Single Mode"]

    Multiple["Return Multiple Modes / Tie"]

    Values --> Count
    Count --> Tie

    Tie -->|"No"| Single
    Tie -->|"Yes"| Multiple
```

---

# 51. Future Improvements

The architecture leaves room for several future capabilities.

## 51.1 Automated Data Collection

Automatically collect product and seller information from supported sources.

---

## 51.2 Better Product Matching

Improve matching using:

- Product identifiers
- Manufacturer part numbers
- Model numbers
- Structured attributes
- Text similarity
- Variant detection

---

## 51.3 Advanced Unit Normalization

Support conversions such as:

```text
kg <-> g
cm <-> inch
GB <-> MB
Ah <-> mAh
```

before aggregation.

---

## 51.4 Historical Specification Tracking

Store observations over time.

```mermaid
flowchart LR

    T1["Observation - Day 1"]
    T2["Observation - Day 7"]
    T3["Observation - Day 30"]

    T1 --> T2
    T2 --> T3

    T3 --> History["Specification History"]
```

This could allow the platform to show when seller-provided information changes.

---

## 51.5 Price Tracking

The same product architecture can eventually support historical price tracking.

---

## 51.6 Redis Caching

Introduce Redis when repeated requests justify a dedicated cache.

---

## 51.7 Background Processing

Expensive tasks such as data collection, normalization, and large-scale aggregation can eventually be moved into asynchronous workers.

---

## 51.8 Observability

Production infrastructure can be extended with:

- Structured logging
- Metrics
- Tracing
- Error monitoring
- Database monitoring

---

# 52. Current Project Status

The project is currently being developed as an MVP.

The current core architecture is:

```mermaid
flowchart LR

    Frontend["Next.js Frontend"]

    Backend["FastAPI Backend"]

    Database[("PostgreSQL")]

    Frontend --> Backend
    Backend --> Database
```

The backend CRUD functionality has been implemented and tested, including correct `404 Not Found` behavior when a requested product does not exist.

The next major application layer is the product comparison experience, where the frontend consumes backend data and presents:

1. Current seller information
2. Manufacturer information
3. Most frequently listed specifications from other sellers

The architecture is intentionally simple enough for rapid MVP development while keeping a clear path toward AWS deployment and future scalability.

---

# 53. FAQ

## Does the frontend connect directly to PostgreSQL?

No.

The frontend communicates with FastAPI, and FastAPI communicates with PostgreSQL.

```mermaid
flowchart LR
    Browser["Browser"] --> Next["Next.js"]
    Next --> FastAPI["FastAPI"]
    FastAPI --> PostgreSQL[("PostgreSQL")]
```

---

## Can local PostgreSQL be replaced with Amazon RDS?

Yes.

The application should use a configurable `DATABASE_URL`.

The same backend code can connect to either local PostgreSQL or Amazon RDS.

---

## Does the RDS database need the same schema as the local database?

Yes.

The recommended approach is to use the same migrations for both environments.

---

## Can a deployed website connect to RDS?

The deployed backend can connect to RDS.

The browser should not connect directly to RDS.

```mermaid
flowchart LR
    User["User"] --> Website["Website"]
    Website --> Backend["Backend"]
    Backend --> RDS[("Amazon RDS")]
```

---

## Why not connect the frontend directly to PostgreSQL?

Doing so would expose database access to the client and bypass application-level validation and business logic.

The backend provides the secure application boundary.

---

## Is the seller mode guaranteed to be correct?

No.

It represents the value most frequently reported by the available sellers.

It should be interpreted as an observed marketplace pattern, not as an authoritative ground truth.

---

## What happens if only one seller provides a specification?

That value becomes the mode because it is the only available observation.

For example:

```text
Seller A -> 16 GB
Seller B -> missing
Seller C -> missing
```

Result:

```text
Seller Mode -> 16 GB
```

---

## What happens if sellers disagree?

The application preserves the disagreement.

For example:

```text
Current Seller -> 1.6 kg
Manufacturer   -> 1.4 kg
Seller Mode    -> 1.5 kg
```

The user can then see the three sources separately.

---

## What happens if there is a tie for the mode?

The application should avoid arbitrarily selecting one value.

If two values have equal highest frequency, both can be represented as modes or the UI can explicitly indicate that the available seller data is tied.

---

# 54. Contributors

AmazonCompare is being developed collaboratively.

The project is structured so contributors can work independently on:

- Frontend
- Backend
- Database
- Comparison logic
- Data collection
- AWS infrastructure
- Testing
- Documentation

Changes should be coordinated through Git branches and merges.

---

# 55. License

Add the project's chosen license here.

For example:

```text
MIT License
```

or whichever license is selected by the project team.

---

# Architecture Summary

The complete architecture can be summarized with the following diagram:

```mermaid
flowchart TB

    User["User"]

    subgraph Frontend["Frontend Layer"]
        Next["Next.js"]
        UI["Product / Comparison UI"]
    end

    subgraph Backend["Backend Layer"]
        FastAPI["FastAPI"]
        Routes["REST API"]
        Validation["Validation"]
        Logic["Business Logic"]
        Comparison["Comparison Engine"]
        ORM["SQLAlchemy"]
    end

    subgraph Database["Data Layer"]
        PostgreSQL[("PostgreSQL")]

        Products["Products"]
        Sellers["Sellers"]
        SellerListings["Seller Listings"]
        SellerSpecs["Seller Specifications"]
        ManufacturerData["Manufacturer Data"]
    end

    subgraph Optional["Future / Optional"]
        Redis[("Redis Cache")]
        Workers["Background Workers"]
    end

    User --> Next
    Next --> UI

    UI --> FastAPI

    FastAPI --> Routes
    Routes --> Validation
    Validation --> Logic

    Logic --> Comparison
    Logic --> ORM

    Comparison --> ORM
    ORM --> PostgreSQL

    PostgreSQL --> Products
    PostgreSQL --> Sellers
    PostgreSQL --> SellerListings
    PostgreSQL --> SellerSpecs
    PostgreSQL --> ManufacturerData

    Logic -.-> Redis
    Logic -.-> Workers
```

---

# Core Comparison Model

The central idea of AmazonCompare is:

```mermaid
flowchart LR

    Product["Product"]

    Current["Current Seller"]
    Manufacturer["Manufacturer"]
    OtherSellers["Other Sellers"]

    Product --> Current
    Product --> Manufacturer
    Product --> OtherSellers

    OtherSellers --> Normalize["Normalize"]
    Normalize --> Frequency["Count Frequency"]
    Frequency --> Mode["Most Frequently Listed Value"]

    Current --> Comparison["Comparison"]
    Manufacturer --> Comparison
    Mode --> Comparison

    Comparison --> Result["User-Facing Comparison"]
```

The final user-facing representation is therefore based on three distinct information sources:

```text
Current Seller
        +
Manufacturer
        +
Most Frequently Listed Specification Among Other Sellers
```

rather than attempting to collapse all sources into one value.

---

# Project Philosophy

AmazonCompare is built around five core principles:

1. **Separate information sources.**
2. **Compare rather than blindly replace values.**
3. **Use the mode to identify the most frequently listed seller specification.**
4. **Keep frontend, backend, and database responsibilities separate.**
5. **Start with a simple MVP while maintaining a clean path toward AWS deployment and scalability.**

The intended architecture is:

```mermaid
flowchart LR

    A["Next.js"] --> B["FastAPI"]
    B --> C["SQLAlchemy"]
    C --> D[("PostgreSQL")]

    B -.-> E[("Future Cache")]
    B -.-> F["Future Background Processing"]
```

This provides a clean foundation for the AmazonCompare MVP and leaves room for more advanced product intelligence, automated data collection, caching, historical analysis, and cloud-scale deployment.
