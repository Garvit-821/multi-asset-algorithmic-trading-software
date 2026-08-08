import { VolatilitySurfacePoint } from '../../services/blackScholesEngine';

interface VolatilitySurfaceTabProps {
  ivSurfaceData: VolatilitySurfacePoint[];
}

export function VolatilitySurfaceTab({ ivSurfaceData }: VolatilitySurfaceTabProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-5 shadow-xs space-y-4">
      <div>
        <h3 className="text-sm sm:text-base font-bold text-gray-900">Implied Volatility (IV) Surface Matrix</h3>
        <p className="text-xs text-gray-500">2D heatmap grid displaying volatility skew across strikes ($K$) and expiration terms (DTE).</p>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-center text-xs font-mono">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px]">
              <th className="py-2.5 px-3 text-left">Strike Price</th>
              <th>7 DTE</th>
              <th>14 DTE</th>
              <th>30 DTE</th>
              <th>60 DTE</th>
              <th>90 DTE</th>
              <th>180 DTE</th>
              <th>365 DTE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.from(new Set(ivSurfaceData.map((d) => d.strike))).map((strike) => {
              return (
                <tr key={strike} className="hover:bg-gray-50">
                  <td className="py-2.5 px-3 text-left font-bold text-gray-900 bg-gray-50 border-r border-gray-200">
                    ${strike}
                  </td>
                  {[7, 14, 30, 60, 90, 180, 365].map((dteVal) => {
                    const pt = ivSurfaceData.find((d) => d.strike === strike && d.dte === dteVal);
                    const iv = pt ? pt.ivPct : 45;
                    const bgClass =
                      iv > 70
                        ? 'bg-rose-100 text-rose-900 font-bold'
                        : iv > 55
                          ? 'bg-amber-100 text-amber-900 font-semibold'
                          : 'bg-emerald-50 text-emerald-800';

                    return (
                      <td key={dteVal} className={`py-2 px-2 rounded ${bgClass}`}>
                        {iv}%
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
