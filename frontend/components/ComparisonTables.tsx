import type { Comparison } from "@/lib/api";

export default function ComparisonTables({ comparison }: { comparison: Comparison }) {
  return (
    <section style={styles.section}>
      <div>
        <h2 style={styles.heading}>Specification comparison</h2>
        <p style={styles.subheading}>Seller listings, the most common seller value, and the manufacturer record.</p>
      </div>
      <div style={styles.tables}>
        <div style={styles.tableCard}><h3>Seller listings</h3><table style={styles.table}><thead><tr><th style={styles.cell}>Seller</th><th style={styles.cell}>Specification</th><th style={styles.cell}>Value</th></tr></thead><tbody>{comparison.seller_listings.flatMap((listing) => listing.specifications.map((specification) => <tr key={`${listing.listing_id}-${specification.specification_name}`}><td style={styles.cell}>{listing.seller_name ?? listing.source}</td><td style={styles.cell}>{specification.specification_name}</td><td style={styles.cell}>{specification.specification_value}</td></tr>))}</tbody></table>{comparison.seller_listings.length === 0 && <p>No seller listings yet.</p>}</div>
        <div style={styles.tableCard}><h3>Most listed value</h3><table style={styles.table}><thead><tr><th style={styles.cell}>Specification</th><th style={styles.cell}>Value</th><th style={styles.cell}>Count</th></tr></thead><tbody>{comparison.seller_modes.map((specification) => <tr key={specification.specification_name}><td style={styles.cell}>{specification.specification_name}</td><td style={styles.cell}>{specification.mode_value ?? "-"}</td><td style={styles.cell}>{specification.frequency}</td></tr>)}</tbody></table>{comparison.seller_modes.length === 0 && <p>No repeated seller values yet.</p>}</div>
        <div style={styles.tableCard}><h3>Manufacturer source</h3><table style={styles.table}><thead><tr><th style={styles.cell}>Specification</th><th style={styles.cell}>Official value</th></tr></thead><tbody>{comparison.manufacturer_specifications.map((specification) => <tr key={specification.specification_name}><td style={styles.cell}>{specification.specification_name}</td><td style={styles.cell}>{specification.specification_value}</td></tr>)}</tbody></table>{comparison.manufacturer_specifications.length === 0 && <p>No manufacturer specifications yet.</p>}</div>
      </div>
    </section>
  );
}

const styles = { section: { display: "grid", gap: "14px" }, heading: { margin: 0 }, subheading: { margin: "6px 0 0", color: "#52606d" }, tables: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px", overflowX: "auto" as const }, tableCard: { minWidth: "250px", padding: "16px", border: "1px solid #d8dee9", borderRadius: "8px", background: "#fff" }, table: { width: "100%", borderCollapse: "collapse" as const, fontSize: "14px" }, cell: { padding: "8px 6px", borderBottom: "1px solid #e5e7eb", textAlign: "left" as const, verticalAlign: "top" as const } };