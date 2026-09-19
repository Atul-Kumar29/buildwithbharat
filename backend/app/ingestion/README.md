# Product ingestion scraper

This package fetches publicly accessible product pages, parses JSON-LD and common HTML specification formats, and exports catalog records without database or API integration.

From `backend/`, configure URLs in `config/products.json` and run:

```text
python -m app.ingestion
```

Outputs are written to `data/output/products.json`, `data/output/products.csv`, and `data/output/failures.json`. A blocked or failed URL is recorded and does not stop the remaining batch. The scraper does not bypass login, CAPTCHA, robots restrictions, or other access controls.

The mocked parser tests can be run with:

```text
python -m pytest app/ingestion/tests -q
```

`data/raw/sample_product.html` is a safe local fixture for demonstrating a successful parse when public sites block automated requests.