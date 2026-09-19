
import type { Comparison } from "@/lib/api";

export default function ComparisonTables({ comparison }: { comparison: Comparison }) {
  const specificationNames = Array.from(
    new Set([
      ...comparison.seller_listings.flatMap((listing) =>
        listing.specifications.map((spec) => spec.specification_name)
      ),
      ...comparison.seller_modes.map((spec) => spec.specification_name),
      ...comparison.manufacturer_specifications.map(
        (spec) => spec.specification_name
      ),
    ])
  );

  function getSellerValue(
    listing: Comparison["seller_listings"][number],
    specificationName: string
  ) {
    return (
      listing.specifications.find(
        (spec) => spec.specification_name === specificationName
      )?.specification_value ?? "-"
    );
  }

  function getModeValue(specificationName: string) {
    return (
      comparison.seller_modes.find(
        (spec) => spec.specification_name === specificationName
      )?.mode_value ?? "-"
    );
  }

  function getManufacturerValue(specificationName: string) {
    return (
      comparison.manufacturer_specifications.find(
        (spec) => spec.specification_name === specificationName
      )?.specification_value ?? "-"
    );
  }

  return (
    <section className="grid gap-4">
      <div>
        <h2 className="text-lg font-bold text-neutral-900">
          Specification Comparison
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Compare seller claims with the most common seller value and
          manufacturer information.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-300 bg-white">
        {specificationNames.length === 0 ? (
          <p className="p-5 text-sm text-neutral-500">
            No comparison data available yet.
          </p>
        ) : (
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-neutral-300 bg-neutral-50">
                <th className="px-4 py-3 text-left font-semibold text-neutral-700">
                  Specification
                </th>

                {comparison.seller_listings.map((listing) => (
                  <th
                    key={listing.listing_id}
                    className="px-4 py-3 text-left font-semibold text-neutral-700"
                  >
                    {listing.seller_name ?? listing.source}
                  </th>
                ))}

                <th className="px-4 py-3 text-left font-semibold text-teal-700">
                  Most Listed
                </th>

                <th className="px-4 py-3 text-left font-semibold text-violet-700">
                  Manufacturer
                </th>
              </tr>
            </thead>

            <tbody>
              {specificationNames.map((specificationName) => {
                const modeValue = getModeValue(specificationName);
                const manufacturerValue =
                  getManufacturerValue(specificationName);

                return (
                  <tr
                    key={specificationName}
                    className="border-b border-neutral-100 last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-neutral-800">
                      {specificationName}
                    </td>

                    {comparison.seller_listings.map((listing) => {
                      const sellerValue = getSellerValue(
                        listing,
                        specificationName
                      );

                      return (
                        <td
                          key={listing.listing_id}
                          className={`px-4 py-3 ${
                            sellerValue !== "-" &&
                            modeValue !== "-" &&
                            sellerValue !== modeValue
                              ? "font-semibold text-amber-700"
                              : "text-neutral-700"
                          }`}
                        >
                          {sellerValue}
                        </td>
                      );
                    })}

                    <td className="px-4 py-3 font-semibold text-teal-700">
                      {modeValue}
                    </td>

                    <td className="px-4 py-3 font-semibold text-violet-700">
                      {manufacturerValue}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {comparison.discrepancies.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
          <h3 className="font-bold text-amber-900">
            Specification differences
          </h3>

          <ul className="mt-2 grid gap-1 text-sm text-amber-800">
            {comparison.discrepancies.map((discrepancy, index) => (
              <li key={index}>⚠ {discrepancy}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

