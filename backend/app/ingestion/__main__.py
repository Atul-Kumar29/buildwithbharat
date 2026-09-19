import argparse
from pathlib import Path

from .scraper import run


def main() -> None:
    parser = argparse.ArgumentParser(description="Scrape public electronics product pages into JSON and CSV")
    parser.add_argument("--config", type=Path, default=Path("config/products.json"))
    parser.add_argument("--output-dir", type=Path, default=Path("data/output"))
    args = parser.parse_args()
    run(args.config, args.output_dir)


if __name__ == "__main__":
    main()