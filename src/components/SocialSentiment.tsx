import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown, AlertCircle, Send, BellRing, Sparkles } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { sendTelegramAlert } from '../services/telegramService';

interface SocialPost {
  id: string;
  platform: 'reddit' | 'twitter';
  author: string;
  content: string;
  sentimentScore: number; // -1.0 to +1.0
  likes: number;
  time: string;
}

interface SentimentAlertRule {
  id: string;
  platform: string;
  threshold: number;
  direction: 'below' | 'above';
  telegramChatId: string;
  active: boolean;
}

const SAMPLE_POST_TEMPLATES = [
  { template: "Bitcoin looking extremely bullish here. EMA crossover indicates continuation of the bull run. $100k target is close!", score: 0.8 },
  { template: "LUNA is experiencing massive depegging! Massive sell liquidations. Absolutely rekt.", score: -0.9 },
  { template: "Just accumulated more SOL. Undervalued sub-200. Solid layer-1 fundamentals.", score: 0.6 },
  { template: "SEC launching fresh investigation. Bearish regulatory pressure. Time to buy puts.", score: -0.7 },
  { template: "Market sentiment is neutral. Trading volume dropping, sideways price action ahead.", score: 0.0 },
  { template: "ETH gas fees dropping. Bullish news for Layer 2 scaling integrations.", score: 0.5 },
  { template: "Massive exchange hack reported! Funds moving to mixer. Dump incoming! Panicking.", score: -0.8 },
  { template: "RSI oversold. Time to buy the dip. Historical returns are positive from here.", score: 0.7 }
];

const MOCK_AUTHORS = ['CryptoWhale', 'AlphaTrader', 'QuantGod', 'BlockChaser', 'SatoshiDisciple', 'RugCheck'];

export function SocialSentiment() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [fearGreedIndex, setFearGreedIndex] = useState<number>(55);
  const [rollingSentiment, setRollingSentiment] = useState<any[]>([]);
  
  // Alert settings
  const [alertRules, setAlertRules] = useState<SentimentAlertRule[]>([]);
  const [newThreshold, setNewThreshold] = useState<string>('-0.5');
  const [newDirection, setNewDirection] = useState<'below' | 'above'>('below');
  const [telegramChatId, setTelegramChatId] = useState<string>('');
  
  const [triggerLog, setTriggerLog] = useState<string[]>([]);

  // Initialize and run polling feed
  useEffect(() => {
    // Generate initial posts
    const initialPosts: SocialPost[] = [];
    for (let i = 0; i < 5; i++) {
      initialPosts.unshift(generateRandomPost());
    }
    setPosts(initialPosts);

    // Initial rolling sentiment data points
    setRollingSentiment(
      Array.from({ length: 10 }, (_, idx) => ({
        tick: idx,
        score: Number((Math.random() * 0.8 - 0.4).toFixed(2))
      }))
    );

    // Live post ingestion loop
    const feedInterval = setInterval(() => {
      const newPost = generateRandomPost();
      
      setPosts(prev => [newPost, ...prev.slice(0, 15)]);

      // Recalculate Fear & Greed Index and rolling average
      setPosts(currentPosts => {
        const avgSentiment = currentPosts.reduce((acc, p) => acc + p.sentimentScore, 0) / currentPosts.length;
        
        // Map average sentiment (-1.0 to 1.0) to index (0 to 100)
        const newIndex = Math.round((avgSentiment + 1.0) * 50);
        setFearGreedIndex(newIndex);

        setRollingSentiment(prevRoll => [
          ...prevRoll.slice(1),
          { tick: prevRoll[prevRoll.length - 1].tick + 1, score: Number(avgSentiment.toFixed(2)) }
        ]);

        // Evaluate alert rules
        evaluateAlerts(newPost, avgSentiment);

        return currentPosts;
      });
    }, 4000);

    return () => clearInterval(feedInterval);
  }, [alertRules]);

  const generateRandomPost = (): SocialPost => {
    const templateIdx = Math.floor(Math.random() * SAMPLE_POST_TEMPLATES.length);
    const authorIdx = Math.floor(Math.random() * MOCK_AUTHORS.length);
    const isTwitter = Math.random() > 0.5;
    
    return {
      id: Math.random().toString(),
      platform: isTwitter ? 'twitter' : 'reddit',
      author: MOCK_AUTHORS[authorIdx],
      content: SAMPLE_POST_TEMPLATES[templateIdx].template,
      sentimentScore: SAMPLE_POST_TEMPLATES[templateIdx].score,
      likes: Math.floor(Math.random() * 250),
      time: new Date().toLocaleTimeString()
    };
  };

  const addAlertRule = () => {
    const thresholdVal = parseFloat(newThreshold);
    if (isNaN(thresholdVal)) return;

    const newRule: SentimentAlertRule = {
      id: Math.random().toString(),
      platform: 'All Platforms',
      threshold: thresholdVal,
      direction: newDirection,
      telegramChatId,
      active: true
    };
    
    setAlertRules([...alertRules, newRule]);
    setTelegramChatId('');
  };

  const removeAlertRule = (id: string) => {
    setAlertRules(alertRules.filter(r => r.id !== id));
  };

  const evaluateAlerts = async (post: SocialPost, currentAvg: number) => {
    for (const rule of alertRules) {
      if (!rule.active) continue;

      let triggered = false;
      if (rule.direction === 'below' && currentAvg < rule.threshold) {
        triggered = true;
      } else if (rule.direction === 'above' && currentAvg > rule.threshold) {
        triggered = true;
      }

      if (triggered) {
        const msg = `⚠️ SENTIMENT ALERT: Social Sentiment Score crossed ${rule.direction} ${rule.threshold}! Current score: ${currentAvg.toFixed(2)}`;
        setTriggerLog(prev => [msg, ...prev.slice(0, 10)]);

        // Dispatch alert to Telegram
        if (rule.telegramChatId) {
          try {
            await sendTelegramAlert(rule.telegramChatId, {
              symbol: 'SENTIMENT_ALERT',
              currentPrice: currentAvg,
              alert_type: 'sentiment',
              message: msg
            });
          } catch (e) {
            console.error('Telegram sentiment dispatch failed', e);
          }
        }
      }
    }
  };

  const getFearGreedText = (idx: number) => {
    if (idx < 25) return { label: 'EXTREME FEAR', color: 'text-red-600 bg-red-50 border-red-200' };
    if (idx < 45) return { label: 'FEAR', color: 'text-orange-600 bg-orange-50 border-orange-200' };
    if (idx < 55) return { label: 'NEUTRAL', color: 'text-gray-600 bg-gray-50 border-gray-200' };
    if (idx < 75) return { label: 'GREED', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    return { label: 'EXTREME GREED', color: 'text-green-600 bg-green-50 border-green-200' };
  };

  const fearGreedMeta = getFearGreedText(fearGreedIndex);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Alternative Data Social Sentiment Feed</h2>
        </div>
        <p className="text-gray-600 mt-1">Monitor real-time social metrics, Fear & Greed levels, and set up automated sentiment-based Telegram alerts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sentiment Indicators Panel */}
        <div className="space-y-8">
          
          {/* Fear & Greed Index */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs text-center space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fear & Greed Index</h3>
            
            <div className="flex flex-col items-center justify-center py-4">
              <div className="text-5xl font-extrabold font-mono text-gray-900 tracking-tight">
                {fearGreedIndex}
              </div>
              <span className={`inline-block px-3.5 py-1.5 rounded-full text-xs font-bold mt-3 border ${fearGreedMeta.color}`}>
                {fearGreedMeta.label}
              </span>
            </div>
            
            {/* Visual Progress Bar */}
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 transition-all duration-500" 
                style={{ width: `${fearGreedIndex}%` }}
              />
            </div>
          </div>

          {/* Alert Configuration */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Configure Sentiment Alert</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 font-semibold block mb-1">Direction</label>
                <select
                  value={newDirection}
                  onChange={(e) => setNewDirection(e.target.value as 'below' | 'above')}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-full text-xs font-semibold text-gray-700 bg-white"
                >
                  <option value="below">Drops Below</option>
                  <option value="above">Spikes Above</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-semibold block mb-1">Sentiment Score (-1.0 to 1.0)</label>
                <input
                  type="text"
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-full font-mono text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 font-semibold block mb-1">Telegram Chat ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 582910482"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-full font-mono text-xs text-gray-900"
                />
              </div>

              <button
                onClick={addAlertRule}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-xs"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Save Alert Rule</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Rolling Chart & Social Stream */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Sentiment Score Chart */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">Rolling Sentiment Score (-1.0 to +1.0)</h3>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rollingSentiment}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f3" />
                  <XAxis dataKey="tick" stroke="#a8acb3" fontSize={10} tickLine={false} />
                  <YAxis stroke="#a8acb3" fontSize={10} tickLine={false} domain={[-1, 1]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #dee1e6' }}
                    itemStyle={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#0052ff' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#0052ff" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Social Media Ingestion Feed */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-gray-900">Live Social Feed Stream</h3>
            
            <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto pr-2 space-y-3">
              {posts.map(post => (
                <div key={post.id} className="pt-3 first:pt-0 flex flex-col space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        post.platform === 'twitter' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {post.platform}
                      </span>
                      <span className="font-bold text-gray-700">@{post.author}</span>
                    </div>
                    <span className="text-gray-400 font-mono text-[10px]">{post.time}</span>
                  </div>

                  <p className="text-xs text-gray-900 leading-relaxed font-medium">
                    {post.content}
                  </p>

                  <div className="flex items-center space-x-6 text-[10px] text-gray-500 font-medium">
                    <span className="flex items-center space-x-1">
                      {post.sentimentScore >= 0 ? (
                        <ThumbsUp className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <ThumbsDown className="w-3.5 h-3.5 text-red-600" />
                      )}
                      <span className="font-mono">
                        Score: {post.sentimentScore >= 0 ? '+' : ''}{post.sentimentScore.toFixed(1)}
                      </span>
                    </span>
                    <span className="font-mono">Likes: {post.likes}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trigger Alerts Log */}
      {triggerLog.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="text-base font-bold text-gray-900">Sentiment Trigger Log</h3>
          </div>
          <div className="space-y-1.5">
            {triggerLog.map((log, idx) => (
              <div key={idx} className="px-4 py-2.5 bg-red-50/50 border border-red-100 rounded-2xl text-xs font-semibold text-red-700 font-mono">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
