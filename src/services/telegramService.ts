/**
 * Telegram Bot Service for sending alerts via secure Supabase Edge Function
 * 
 * Security Note:
 * Bot tokens are server-side secrets (TELEGRAM_BOT_TOKEN) stored in Supabase Edge Function
 * secrets or backend environment variables. The client application NEVER holds or exposes
 * the raw bot token in browser JavaScript bundles.
 */

import { supabase } from '../lib/supabase';

export interface TelegramAlert {
  symbol: string;
  assetType: string;
  exchange?: string;
  alertType: string;
  targetPrice?: number;
  currentPrice?: number;
  message?: string;
}

/**
 * Send an alert to Telegram via server-side Edge Function
 */
export async function sendTelegramAlert(
  chatId: string,
  alert: TelegramAlert
): Promise<boolean> {
  if (!chatId) {
    console.warn('Telegram chat ID not configured');
    return false;
  }

  const message = formatAlertMessage(alert);

  try {
    const { data, error } = await supabase.functions.invoke('send-telegram-alert', {
      body: {
        chatId,
        message,
      },
    });

    if (error) {
      console.error('Failed to send Telegram alert via backend Edge Function:', error.message || error);
      return false;
    }

    if (data?.error) {
      console.error('Telegram API error from backend:', data.error);
      return false;
    }

    return data?.success === true;
  } catch (error) {
    console.error('Failed to send Telegram alert:', error);
    return false;
  }
}

function formatAlertMessage(alert: TelegramAlert): string {
  const symbol = alert.exchange 
    ? `${alert.symbol}.${alert.exchange}` 
    : alert.symbol;

  let message = `🔔 *Price Alert Triggered*\n\n`;
  message += `*Symbol:* ${symbol}\n`;
  message += `*Asset Type:* ${alert.assetType.toUpperCase()}\n`;
  message += `*Alert Type:* ${alert.alertType.replace('_', ' ').toUpperCase()}\n`;

  if (alert.targetPrice) {
    message += `*Target Price:* $${alert.targetPrice.toFixed(4)}\n`;
  }

  if (alert.currentPrice) {
    message += `*Current Price:* $${alert.currentPrice.toFixed(4)}\n`;
  }

  if (alert.message) {
    message += `\n*Message:* ${alert.message}\n`;
  }

  message += `\n_Generated at ${new Date().toLocaleString()}_`;

  return message;
}

/**
 * Verify Telegram bot server-side configuration status
 */
export async function verifyTelegramConfig(chatId?: string): Promise<boolean> {
  if (!chatId) return false;

  try {
    const { data, error } = await supabase.functions.invoke('send-telegram-alert', {
      body: {
        chatId,
        message: '🔔 *Stratrade Connection Test*\n\nTelegram alert dispatch successfully verified!',
      },
    });

    if (error || data?.error) {
      return false;
    }

    return data?.success === true;
  } catch {
    return false;
  }
}
