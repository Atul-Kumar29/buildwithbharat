import type { Comparison } from "@/lib/api";

export default function ComparisonTables({ comparison }: { comparison: Comparison }) {
  return (
    <section className="grid gap-4">
      <div>
        <h2 className="text-lg font-bold text-neutral-900">Specification Comparison</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Seller listings, most common seller value, and manufacturer record.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Seller listings */}
        <div className="rounded-xl border border-neutral-300 bg-white p-4">
          <h3 className="mb-3 text-sm font-bold text-neutral-900">Seller Listings</h3>
          {comparison.seller_listings.length === 0 ? (
            <p className="text-sm text-neutral-500">No seller listings yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="pb-2 pr-3 text-left font-semibold text-neutral-700">Seller</th>
                    <th className="pb-2 pr-3 text-left font-semibold text-neutral-700">Spec</th>
                    <th className="pb-2 text-left font-semibold text-neutral-700">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.seller_listings.flatMap((listing) =>
                    listing.specifications.map((spec) => (
                      <tr key={`${listing.listing_id}-${spec.specification_name}`} className="border-b border-neutral-100 last:border-0">
                        <td className="py-2 pr-3 text-neutral-600">{listing.seller_name ?? listing.source}</td>
                        <td className="py-2 pr-3 text-neutral-700">{spec.specification_name}</td>
                        <td className="py-2 text-neutral-900">{spec.specification_value}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Most listed value */}
        <div className="rounded-xl border border-neutral-300 bg-white p-4">
          <h3 className="mb-3 text-sm font-bold text-neutral-900">Most Listed Value</h3>
          {comparison.seller_modes.length === 0 ? (
            <p className="text-sm text-neutral-500">No repeated seller values yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="pb-2 pr-3 text-left font-semibold text-neutral-700">Spec</th>
                    <th className="pb-2 pr-3 text-left font-semibold text-neutral-700">Value</th>
                    <th className="pb-2 text-left font-semibold text-neutral-700">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.seller_modes.map((spec) => (
                    <tr key={spec.specification_name} className="border-b border-neutral-100 last:border-0">
                      <td className="py-2 pr-3 text-neutral-700">{spec.specification_name}</td>
                      <td className="py-2 pr-3 text-neutral-900">{spec.mode_value ?? "-"}</td>
                      <td className="py-2 text-neutral-600">{spec.frequency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Manufacturer specs */}
        <div className="rounded-xl border border-neutral-300 bg-white p-4">
          <h3 className="mb-3 text-sm font-bold text-neutral-900">Manufacturer Source</h3>
          {comparison.manufacturer_specifications.length === 0 ? (
            <p className="text-sm text-neutral-500">No manufacturer specifications yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="pb-2 pr-3 text-left font-semibold text-neutral-700">Spec</th>
                    <th className="pb-2 text-left font-semibold text-neutral-700">Official Value</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.manufacturer_specifications.map((spec) => (
                    <tr key={spec.specification_name} className="border-b border-neutral-100 last:border-0">
                      <td className="py-2 pr-3 text-neutral-700">{spec.specification_name}</td>
                      <td className="py-2 text-neutral-900">{spec.specification_value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}