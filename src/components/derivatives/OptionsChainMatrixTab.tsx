import { OptionChainItem } from '../../services/blackScholesEngine';

interface OptionsChainMatrixTabProps {
  optionChain: OptionChainItem[];
  currentSpot: number;
}

export function OptionsChainMatrixTab({ optionChain, currentSpot }: OptionsChainMatrixTabProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900">Institutional Option Chain Matrix</h3>
          <p className="text-xs text-gray-500">Live strike prices, Call & Put quotes, IV %, and Delta/Gamma risk profiles.</p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center space-x-1 font-semibold text-emerald-600">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span>
            <span>CALLS</span>
          </span>
          <span className="flex items-center space-x-1 font-semibold text-rose-600">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block"></span>
            <span>PUTS</span>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-none no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="text-[10px] text-gray-500 sm:hidden mb-2 flex items-center justify-between font-mono bg-gray-50 px-2 py-1 rounded">
          <span>← Swipe left/right for Call/Put Greeks →</span>
          <span className="font-bold text-blue-600">Matrix</span>
        </div>
        <table className="w-full text-left text-xs font-mono min-w-[720px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px]">
              <th className="py-2.5 px-3 text-emerald-700">Call Bid</th>
              <th className="py-2.5 px-3 text-emerald-700">Call Ask</th>
              <th className="py-2.5 px-3 text-emerald-700">Call IV</th>
              <th className="py-2.5 px-3 text-emerald-700">Call $\Delta$</th>
              <th className="py-2.5 px-3 text-center bg-gray-100 text-gray-900 font-extrabold">STRIKE ($K$)</th>
              <th className="py-2.5 px-3 text-rose-700">Put $\Delta$</th>
              <th className="py-2.5 px-3 text-rose-700">Put IV</th>
              <th className="py-2.5 px-3 text-rose-700">Put Bid</th>
              <th className="py-2.5 px-3 text-rose-700">Put Ask</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {optionChain.map((item) => {
              const isAtm = Math.abs(item.strike - currentSpot) < (currentSpot * 0.02);
              return (
                <tr
                  key={item.strike}
                  className={`hover:bg-gray-50/80 transition-colors ${isAtm ? 'bg-amber-50/60 font-bold' : ''}`}
                >
                  {/* Call Bid/Ask */}
                  <td className="py-2.5 px-3 text-emerald-600 font-semibold">${item.callBid}</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-semibold">${item.callAsk}</td>
                  <td className="py-2.5 px-3 text-gray-600">{item.callIvPct}%</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-700">+{item.callGreeks.delta}</td>

                  {/* Strike */}
                  <td className="py-2.5 px-3 text-center bg-gray-50 font-extrabold text-gray-900 border-x border-gray-200">
                    ${item.strike}
                    {isAtm && <span className="ml-1 text-[9px] text-amber-700 bg-amber-200 px-1 rounded">ATM</span>}
                  </td>

                  {/* Put Delta */}
                  <td className="py-2.5 px-3 font-semibold text-rose-700">{item.putGreeks.delta}</td>
                  <td className="py-2.5 px-3 text-gray-600">{item.putIvPct}%</td>
                  <td className="py-2.5 px-3 text-rose-600 font-semibold">${item.putBid}</td>
                  <td className="py-2.5 px-3 text-rose-600 font-semibold">${item.putAsk}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
