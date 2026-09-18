"use client";

import { FormEvent, useState } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
	const router = useRouter();
	const [query, setQuery] = useState(initialQuery);

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const trimmedQuery = query.trim();
		router.push(trimmedQuery ? `/?q=${encodeURIComponent(trimmedQuery)}` : "/");
	}

	function clearSearch() {
		setQuery("");
		router.push("/");
	}

	return (
		<form onSubmit={handleSubmit} style={styles.form} role="search">
			<label htmlFor="product-search" style={styles.label}>Search products</label>
			<div style={styles.controls}>
				<div style={styles.inputWrapper}>
					<Search size={18} aria-hidden="true" style={styles.searchIcon} />
					<input
						id="product-search"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Search by name, brand, or ASIN"
						style={styles.input}
					/>
					{query && (
						<button type="button" onClick={clearSearch} style={styles.clearButton} aria-label="Clear search">
							<X size={17} aria-hidden="true" />
						</button>
					)}
				</div>
				<button type="submit" style={styles.button}>
					<Search size={17} aria-hidden="true" />
					Search
				</button>
			</div>
		</form>
	);
}

const styles = {
	form: { display: "grid", gap: "8px" },
	label: { fontWeight: 700 },
	controls: { display: "flex", gap: "10px" },
	inputWrapper: { position: "relative" as const, flex: 1 },
	searchIcon: { position: "absolute" as const, left: "12px", top: "12px", color: "#52606d" },
	input: {
		width: "100%",
		boxSizing: "border-box" as const,
		padding: "10px 40px 10px 38px",
		border: "1px solid #b8c2cc",
		borderRadius: "5px",
		background: "white",
		font: "inherit",
	},
	clearButton: {
		position: "absolute" as const,
		right: "8px",
		top: "7px",
		display: "grid",
		placeItems: "center",
		padding: "5px",
		border: 0,
		background: "transparent",
		color: "#52606d",
		cursor: "pointer",
	},
	button: {
		display: "inline-flex",
		alignItems: "center",
		gap: "7px",
		padding: "10px 15px",
		border: 0,
		borderRadius: "5px",
		background: "#162b4d",
		color: "white",
		cursor: "pointer",
		font: "inherit",
		fontWeight: 700,
	},
};
