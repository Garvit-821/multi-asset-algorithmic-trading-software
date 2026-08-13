import React from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  Activity,
  AlertCircle,
  CheckCircle2,
  Layers,
  ShieldAlert,
} from 'lucide-react';

interface FormattedAIResponseProps {
  content: string;
  isUser?: boolean;
}

export const FormattedAIResponse: React.FC<FormattedAIResponseProps> = ({
  content,
  isUser = false,
}) => {
  if (isUser) {
    return <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed">{content}</div>;
  }

  // Parse lines into structured visual blocks
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];

  let currentMetricsList: { label: string; value: string; rawLine: string }[] = [];

  const flushMetrics = () => {
    if (currentMetricsList.length === 0) return;

    const metricsToRender = [...currentMetricsList];
    currentMetricsList = [];

    blocks.push(
      <div key={`metrics-grid-${blocks.length}`} className="my-3 grid grid-cols-1 sm:grid-cols-2 gap-2 font-sans">
        {metricsToRender.map((m, idx) => {
          const lowerLabel = m.label.toLowerCase();
          const lowerVal = m.value.toLowerCase();

          // Extract percentage if present (e.g. 12.5%)
          const pctMatch = m.value.match(/(\d+(?:\.\d+)?)\s*%/);
          const percentVal = pctMatch ? parseFloat(pctMatch[1]) : null;

          const hasNegativePnL = m.value.includes('-') || lowerLabel.includes('loss') || lowerLabel.includes('drawdown');

          let Icon = Activity;
          let colorTheme = 'border-blue-200 bg-blue-50/60 text-blue-900';
          let iconColor = 'text-blue-600 bg-blue-100';
          let barColor = 'bg-blue-600';

          if (lowerLabel.includes('cash') || lowerLabel.includes('available') || lowerLabel.includes('capital')) {
            Icon = DollarSign;
            colorTheme = 'border-emerald-200 bg-emerald-50/50 text-emerald-950';
            iconColor = 'text-emerald-600 bg-emerald-100';
            barColor = 'bg-emerald-500';
          } else if (lowerLabel.includes('win rate') || lowerLabel.includes('accuracy') || lowerLabel.includes('ratio')) {
            Icon = lowerVal.includes('cannot') || lowerVal.includes('n/a') || lowerVal.includes('insufficient') ? AlertCircle : CheckCircle2;
            colorTheme = lowerVal.includes('cannot') || lowerVal.includes('n/a') ? 'border-amber-200 bg-amber-50/60 text-amber-950' : 'border-purple-200 bg-purple-50/60 text-purple-950';
            iconColor = lowerVal.includes('cannot') || lowerVal.includes('n/a') ? 'text-amber-600 bg-amber-100' : 'text-purple-600 bg-purple-100';
            barColor = 'bg-purple-600';
          } else if (lowerLabel.includes('pnl') || lowerLabel.includes('return') || lowerLabel.includes('profit')) {
            if (hasNegativePnL) {
              Icon = TrendingDown;
              colorTheme = 'border-rose-200 bg-rose-50/60 text-rose-950';
              iconColor = 'text-rose-600 bg-rose-100';
              barColor = 'bg-rose-500';
            } else {
              Icon = TrendingUp;
              colorTheme = 'border-emerald-200 bg-emerald-50/60 text-emerald-950';
              iconColor = 'text-emerald-600 bg-emerald-100';
              barColor = 'bg-emerald-500';
            }
          } else if (lowerLabel.includes('position') || lowerLabel.includes('allocation') || lowerLabel.includes('exposure')) {
            Icon = PieChart;
            colorTheme = 'border-indigo-200 bg-indigo-50/60 text-indigo-950';
            iconColor = 'text-indigo-600 bg-indigo-100';
            barColor = 'bg-indigo-600';
          }

          return (
            <div
              key={idx}
              className={`p-3 rounded-2xl border ${colorTheme} flex flex-col justify-between space-y-2 shadow-2xs hover:shadow-xs transition-all`}
            >
              <div className="flex items-start justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
                    <Icon className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                  <span className="text-[11px] font-bold tracking-tight opacity-90 leading-snug">
                    {renderInlineFormattedText(m.label)}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs sm:text-sm font-extrabold font-mono tracking-tight leading-snug break-words">
                  {renderInlineFormattedText(m.value)}
                </div>

                {/* Progress bar visual for percentage metrics */}
                {percentVal !== null && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
                      <span>Allocation Share</span>
                      <span className="font-bold">{percentVal}%</span>
                    </div>
                    <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all duration-500`}
                        style={{ width: `${Math.min(100, Math.max(0, percentVal))}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushMetrics();
      continue;
    }

    // Check header tags
    if (trimmed.startsWith('# ') || trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
      flushMetrics();
      const titleText = trimmed.replace(/^#+\s*/, '');
      blocks.push(
        <div key={`header-${i}`} className="pt-2 pb-1 border-b border-gray-200/80 mb-2 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-blue-600 shrink-0" />
          <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 tracking-tight">
            {renderInlineFormattedText(titleText)}
          </h4>
        </div>
      );
      continue;
    }

    // Check for metric bullet points (e.g. * **Available Cash**: $12,661.78)
    const metricBulletMatch = trimmed.match(/^[*-]\s+\*\*([^*:]+)\*\*:\s*(.+)$/);
    if (metricBulletMatch) {
      const [, label, val] = metricBulletMatch;
      currentMetricsList.push({ label, value: val, rawLine });
      continue;
    }

    // Standard bullet points
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      flushMetrics();
      const bulletContent = trimmed.substring(2);
      blocks.push(
        <div key={`bullet-${i}`} className="flex items-start space-x-2.5 my-1.5 pl-1 text-xs leading-relaxed text-gray-800">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
          <div className="flex-1">{renderInlineFormattedText(bulletContent)}</div>
        </div>
      );
      continue;
    }

    // Warning / Note Callout box detector
    if (trimmed.toLowerCase().startsWith('note:') || trimmed.toLowerCase().startsWith('warning:') || trimmed.toLowerCase().startsWith('important:')) {
      flushMetrics();
      blocks.push(
        <div key={`alert-${i}`} className="my-2.5 p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs flex items-start space-x-2.5 shadow-2xs">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed flex-1">{renderInlineFormattedText(trimmed)}</div>
        </div>
      );
      continue;
    }

    // Regular line text
    flushMetrics();
    blocks.push(
      <p key={`p-${i}`} className="my-1 text-xs leading-relaxed text-gray-800 font-sans">
        {renderInlineFormattedText(trimmed)}
      </p>
    );
  }

  flushMetrics();

  return <div className="space-y-1 font-sans">{blocks}</div>;
};

// Helper function to render bold, code, inline metrics cleanly
function renderInlineFormattedText(text: string): React.ReactNode {
  // Split text by markdown bold pattern **bold** and inline code `code`
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-extrabold text-gray-900">
          {boldText}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      const codeText = part.slice(1, -1);
      return (
        <code key={index} className="px-1.5 py-0.5 bg-gray-200/70 text-blue-900 rounded font-mono text-[11px] font-bold border border-gray-300/60">
          {codeText}
        </code>
      );
    }

    // Clean up long raw floating points in text if found (e.g. 1.5507009544758485 -> 1.5507)
    const cleanedText = part.replace(/(\d+\.\d{4})\d+/g, '$1');
    return <React.Fragment key={index}>{cleanedText}</React.Fragment>;
  });
}
