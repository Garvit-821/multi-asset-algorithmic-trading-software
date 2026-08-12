import { paperTradingService, Portfolio } from './paperTradingService';
import { getGeminiModel } from './aiCopilotService';
import { getTerminalTheme } from './themeService';

export interface ApplicationBackupData {
  version: string;
  timestamp: string;
  portfolio: Portfolio;
  settings: {
    geminiModel: string;
    terminalTheme: string;
    audioEnabled: boolean;
  };
}

export const backupService = {
  /** Export full application state as a formatted JSON snapshot download */
  exportStateJSON(): void {
    const portfolio = paperTradingService.getPortfolio();
    const backupData: ApplicationBackupData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      portfolio,
      settings: {
        geminiModel: getGeminiModel(),
        terminalTheme: getTerminalTheme(),
        audioEnabled: localStorage.getItem('stratrade_audio_enabled') !== 'false',
      },
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `stratrade_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  /** Export active portfolio positions as CSV */
  exportPositionsCSV(): void {
    const portfolio = paperTradingService.getPortfolio();
    if (portfolio.positions.length === 0) {
      alert('No active positions to export.');
      return;
    }

    const headers = ['Symbol', 'Asset Type', 'Quantity', 'Average Entry Price', 'Date Opened'];
    const rows = portfolio.positions.map(p => [
      p.symbol,
      p.assetType,
      p.quantity.toString(),
      p.averageEntryPrice.toString(),
      new Date().toLocaleDateString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `stratrade_positions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  /** Validate and restore portfolio state from uploaded JSON */
  async importStateJSON(file: File): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const data = JSON.parse(content) as ApplicationBackupData;

          if (!data || !data.portfolio || typeof data.portfolio.cash !== 'number') {
            resolve({ success: false, message: 'Invalid backup file structure.' });
            return;
          }

          // Restore portfolio state
          localStorage.setItem('stratrade_paper_portfolio', JSON.stringify(data.portfolio));
          
          if (data.settings) {
            if (data.settings.geminiModel) localStorage.setItem('stratrade_gemini_model', data.settings.geminiModel);
            if (data.settings.terminalTheme) localStorage.setItem('stratrade_terminal_theme', data.settings.terminalTheme);
            if (data.settings.audioEnabled !== undefined) localStorage.setItem('stratrade_audio_enabled', String(data.settings.audioEnabled));
          }

          resolve({ success: true, message: 'Portfolio & Settings state successfully restored!' });
        } catch {
          resolve({ success: false, message: 'Failed to parse JSON backup file.' });
        }
      };
      reader.readAsText(file);
    });
  },
};
