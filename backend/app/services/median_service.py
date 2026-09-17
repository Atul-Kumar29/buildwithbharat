from collections import defaultdict
from statistics import median
import re


UNIT_MULTIPLIERS = {
    "gb": 1,
    "tb": 1024,
    "mb": 1 / 1024,
    "g": 1,
    "kg": 1000,
    "mg": 1,
    "cm": 1,
    "mm": 0.1,
    "m": 100,
    "inch": 2.54,
    "in": 2.54,
}


def parse_numeric_value(value: str):
    """
    Extract a numeric value and optional unit from a specification.

    Examples:
        "8 GB"      -> (8.0, "gb")
        "16GB"      -> (16.0, "gb")
        "1 TB"      -> (1.0, "tb")
        "2.5 kg"    -> (2.5, "kg")
    """
    match = re.search(
        r"([-+]?\d+(?:\.\d+)?)\s*([a-zA-Z]+)?",
        value.strip()
    )

    if not match:
        return None

    number = float(match.group(1))
    unit = match.group(2).lower() if match.group(2) else None

    return number, unit


def calculate_medians(specifications):
    """
    Calculate median numeric values grouped by specification name.

    specifications:
        iterable of ListingSpecification objects
    """

    grouped = defaultdict(list)
    units = {}

    for spec in specifications:
        parsed = parse_numeric_value(spec.specification_value)

        if parsed is None:
            continue

        value, unit = parsed

        # Only normalize units that we explicitly understand.
        if unit in UNIT_MULTIPLIERS:
            normalized_value = value * UNIT_MULTIPLIERS[unit]
            normalized_unit = unit

            grouped[spec.specification_name.lower()].append(
                normalized_value
            )

            units[spec.specification_name.lower()] = normalized_unit

        elif unit is None:
            grouped[spec.specification_name.lower()].append(value)
            units[spec.specification_name.lower()] = None

    results = []

    for name, values in grouped.items():
        results.append({
            "specification_name": name,
            "median_value": median(values),
            "unit": units.get(name),
        })

    return results