// Server-Side Key Vault Helper Stubs
// Client-side WebCrypto key storage has been deprecated in favor of Supabase Server Edge Functions.

import { exchangeConnector, ExchangeId } from '../services/exchangeConnector';

export function hasStoredCredentials(): boolean {
  // Legacy stub - returns false to prevent client-side localStorage fallback
  return false;
}

export async function clearStoredCredentials(): Promise<void> {
  const exchanges: ExchangeId[] = ['binance', 'binance_testnet', 'coinbase', 'kraken'];
  for (const ex of exchanges) {
    try {
      await exchangeConnector.deleteServerCredentials(ex);
    } catch (_e) {
      // Ignore
    }
  }
}
