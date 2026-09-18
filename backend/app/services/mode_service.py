from collections import Counter


def calculate_modes(specifications):
    """
    Calculate the most frequently reported value for each specification.

    specifications:
        iterable of ListingSpecification objects
    """

    grouped = {}

    for spec in specifications:
        name = spec.specification_name.lower()
        value = spec.specification_value.strip()

        if name not in grouped:
            grouped[name] = []

        grouped[name].append(value)

    results = []

    for name, values in grouped.items():
        counts = Counter(values)
        max_count = max(counts.values())

        # No unique mode if every value occurs only once.
        if max_count == 1:
            continue

        modes = [
            value
            for value, count in counts.items()
            if count == max_count
        ]

        results.append({
            "specification_name": name,
            "mode_values": modes,
            "frequency": max_count,
        })

    return results