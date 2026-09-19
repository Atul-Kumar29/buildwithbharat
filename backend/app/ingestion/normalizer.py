import re


def _format_number(value: float) -> str:
	return str(int(value)) if value.is_integer() else f"{value:.2f}".rstrip("0").rstrip(".")


def normalize_specification(value: str) -> str:
	"""Normalize common electronics units while retaining meaningful qualifiers."""
	original = " ".join(str(value).split()).strip()
	if not original:
		return ""

	memory_suffix = re.fullmatch(r"(?i)(\d+(?:\.\d+)?)\s*(gb|tb|mb)\s+(?:ram|memory)", original)
	if memory_suffix:
		original = f"{memory_suffix.group(1)} {memory_suffix.group(2)}"
	normalized = original
	normalized = re.sub(r"(?i)(?<=\d)(?=(?:gb|tb|mb|kg|g|mm|cm|inch|in)\b)", " ", normalized)
	normalized = re.sub(r"\s+", " ", normalized).strip()

	weight_match = re.fullmatch(r"(?i)(\d+(?:\.\d+)?)\s*g", normalized)
	if weight_match:
		return f"{_format_number(float(weight_match.group(1)) / 1000)} kg"

	normalized = re.sub(
		r"(?i)\b(\d+(?:\.\d+)?)\s*(gb|tb|mb|kg|g|mm|cm|inch|in)\b",
		lambda match: f"{_format_number(float(match.group(1)))} {match.group(2).upper() if match.group(2).lower() in {'gb', 'tb', 'mb'} else match.group(2).lower()}",
		normalized,
	)
	return normalized


def normalize_key(value: str) -> str:
	value = re.sub(r"(?i)\bi\s*/\s*o\b", "io", value)
	return re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_")
