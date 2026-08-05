/**
 * Alert Monitoring Service
 * 
 * This service monitors active price alerts and triggers them when conditions are met.
 * In production, this should run as a background service or scheduled job.
 */

import { supabase } from '../lib/supabase';
import { fetchLatestCandle } from './dataFeed';
import { sendTelegramAlert } from './telegramService';
import type { AssetType } from '../components/TradingViewChart';

interface PriceAlert {
  id: string;
  user_id: string;
  symbol: string;
  asset_type: AssetType;
  exchange?: string;
  alert_type: 'price_above' | 'price_below' | 'price_cross' | 'manual';
  target_price?: number;
  condition_value?: number;
  status: 'active' | 'triggered' | 'cancelled';
  telegram_enabled: boolean;
  telegram_chat_id?: string;
}

/**
 * Check all active alerts and trigger those that meet conditions
 * This should be called periodically (e.g., every 30 seconds)
 */
export async function checkAndTriggerAlerts(): Promise<void> {
  // Fetch all active alerts
  const { data: alerts, error } = await supabase
    .from('price_alerts')
    .select('*')
    .eq('status', 'active');

  if (error || !alerts) {
    console.error('Failed to fetch alerts:', error);
    return;
  }

  for (const alert of alerts as PriceAlert[]) {
    try {
      // Fetch current price
      const latestCandle = await fetchLatestCandle(
        alert.symbol,
        alert.asset_type
      );

      if (!latestCandle || !latestCandle.close) {
        continue;
      }

      const currentPrice = latestCandle.close;
      let shouldTrigger = false;

      // Check alert conditions
      switch (alert.alert_type) {
        case 'price_above':
          if (alert.target_price && currentPrice >= alert.target_price) {
            shouldTrigger = true;
          }
          break;
        case 'price_below':
          if (alert.target_price && currentPrice <= alert.target_price) {
            shouldTrigger = true;
          }
          break;
        case 'price_cross':
          // For cross alerts, we'd need to track previous price
          // This is simplified - in production, track price history
          if (alert.target_price && Math.abs(currentPrice - alert.target_price) < 0.01) {
            shouldTrigger = true;
          }
          break;
        case 'manual':
          // Manual alerts are triggered by user action, not price monitoring
          break;
      }

      if (shouldTrigger) {
        // Update alert status
        await supabase
          .from('price_alerts')
          .update({
            status: 'triggered',
            triggered_at: new Date().toISOString(),
          })
          .eq('id', alert.id);

        // Send Telegram notification if enabled
        if (alert.telegram_enabled && alert.telegram_chat_id) {
          await sendTelegramAlert(alert.telegram_chat_id, {
            symbol: alert.symbol,
            assetType: alert.asset_type,
            exchange: alert.exchange,
            alertType: alert.alert_type,
            targetPrice: alert.target_price,
            currentPrice: currentPrice,
          });
        }

        console.log(`Alert triggered: ${alert.symbol} at $${currentPrice}`);
      }
    } catch (error) {
      console.error(`Error checking alert ${alert.id}:`, error);
    }
  }
}

/**
 * Start monitoring alerts (polling every intervalMs milliseconds)
 * In production, use a proper job scheduler or WebSocket for real-time updates
 */
export function startAlertMonitoring(intervalMs: number = 30000): () => void {
  // Initial check
  checkAndTriggerAlerts();

  // Set up interval
  const interval = setInterval(() => {
    checkAndTriggerAlerts();
  }, intervalMs);

  // Return cleanup function
  return () => clearInterval(interval);
}

