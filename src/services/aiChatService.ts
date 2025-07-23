'use client';

// AI Trading Chatbot Service using Groq API
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: 'text' | 'stock_analysis' | 'market_insight' | 'trading_tip';
}

interface StockAnalysisRequest {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
}

interface MarketContext {
  userPortfolio?: any[];
  watchlist?: string[];
  recentTrades?: any[];
  marketSession?: string;
}

class AIChatService {
  private apiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private conversationHistory: ChatMessage[] = [];

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Groq API key not found. AI chat will not work.');
    }
  }

  // Initialize conversation with system prompt
  private getSystemPrompt(): string {
    return `You are TradeKaro AI, an intelligent trading assistant for Indian stock markets. You are knowledgeable about:

🏛️ INDIAN STOCK MARKETS:
- NSE, BSE, NIFTY 50, Bank Nifty, sectoral indices
- Indian companies, sectors, and market dynamics
- Trading hours (9:15 AM - 3:30 PM IST)
- Indian trading terminology and practices

📊 TRADING EXPERTISE:
- Technical analysis, chart patterns, indicators
- Fundamental analysis, P/E ratios, market cap analysis
- Risk management, position sizing, stop losses
- Order types: Market, Limit, SL, SL-M, Bracket, Cover, GTT

💡 YOUR PERSONALITY:
- Friendly, professional, and encouraging
- Use emojis appropriately (📈📉💰🚀)
- Provide actionable insights, not just generic advice
- Always emphasize risk management and responsible trading
- Speak in a mix of English with occasional Hindi trading terms

⚠️ IMPORTANT DISCLAIMERS:
- Always remind users this is for educational purposes
- Mention that past performance doesn't guarantee future results
- Encourage users to do their own research (DYOR)
- Never guarantee profits or specific price targets

Keep responses concise, practical, and engaging. Focus on helping users learn and make informed decisions.`;
  }

  // Send message to AI and get response
  async sendMessage(
    message: string, 
    context?: MarketContext,
    stockData?: StockAnalysisRequest
  ): Promise<ChatMessage> {
    if (!this.apiKey) {
      throw new Error('Groq API key not configured');
    }

    try {
      // Add user message to history
      const userMessage: ChatMessage = {
        id: this.generateId(),
        role: 'user',
        content: message,
        timestamp: new Date()
      };
      this.conversationHistory.push(userMessage);

      // Prepare context-aware prompt
      let enhancedMessage = message;
      
      if (stockData) {
        enhancedMessage += `\n\nStock Data Context:
- Symbol: ${stockData.symbol}
- Current Price: ₹${stockData.currentPrice}
- Change: ${stockData.change >= 0 ? '+' : ''}₹${stockData.change} (${stockData.changePercent.toFixed(2)}%)
- Volume: ${stockData.volume.toLocaleString()}`;
      }

      if (context?.marketSession) {
        enhancedMessage += `\n\nMarket Status: ${context.marketSession}`;
      }

      if (context?.userPortfolio && context.userPortfolio.length > 0) {
        enhancedMessage += `\n\nUser Portfolio: ${context.userPortfolio.length} positions`;
      }

      // Prepare messages for API
      const messages = [
        { role: 'system', content: this.getSystemPrompt() },
        ...this.conversationHistory.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: enhancedMessage }
      ];

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192', // Fast Groq model
          messages,
          max_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || 'Sorry, I could not process your request.';

      // Create AI message
      const aiMessage: ChatMessage = {
        id: this.generateId(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        type: this.detectMessageType(message, aiResponse)
      };

      this.conversationHistory.push(aiMessage);
      return aiMessage;

    } catch (error) {
      console.error('AI Chat Service Error:', error);
      
      // Fallback response
      const fallbackMessage: ChatMessage = {
        id: this.generateId(),
        role: 'assistant',
        content: this.getFallbackResponse(message),
        timestamp: new Date(),
        type: 'text'
      };

      this.conversationHistory.push(fallbackMessage);
      return fallbackMessage;
    }
  }

  // Analyze specific stock
  async analyzeStock(stockData: StockAnalysisRequest): Promise<ChatMessage> {
    const analysisPrompt = `Please analyze ${stockData.symbol} stock:
- Current Price: ₹${stockData.currentPrice}
- Today's Change: ${stockData.change >= 0 ? '+' : ''}₹${stockData.change} (${stockData.changePercent.toFixed(2)}%)
- Volume: ${stockData.volume.toLocaleString()}

Provide a brief technical and fundamental analysis with key insights for Indian traders.`;

    return this.sendMessage(analysisPrompt, undefined, stockData);
  }

  // Get market insights
  async getMarketInsights(context: MarketContext): Promise<ChatMessage> {
    const insightPrompt = `Give me current market insights for Indian stock markets. 
Market Status: ${context.marketSession}
Focus on key sectors, market sentiment, and trading opportunities for today.`;

    return this.sendMessage(insightPrompt, context);
  }

  // Get trading tips
  async getTradingTips(userLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'): Promise<ChatMessage> {
    const tipPrompt = `Share a practical trading tip for ${userLevel} Indian stock traders. 
Focus on risk management, entry/exit strategies, or market psychology.`;

    return this.sendMessage(tipPrompt);
  }

  // Detect message type for UI styling
  private detectMessageType(userMessage: string, aiResponse: string): 'text' | 'stock_analysis' | 'market_insight' | 'trading_tip' {
    const lowerMessage = userMessage.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();

    if (lowerMessage.includes('analyze') || lowerMessage.includes('analysis') || lowerResponse.includes('technical analysis')) {
      return 'stock_analysis';
    }
    
    if (lowerMessage.includes('market') || lowerMessage.includes('nifty') || lowerMessage.includes('sensex')) {
      return 'market_insight';
    }
    
    if (lowerMessage.includes('tip') || lowerMessage.includes('advice') || lowerMessage.includes('strategy')) {
      return 'trading_tip';
    }

    return 'text';
  }

  // Fallback responses when API fails
  private getFallbackResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('analyze') || lowerMessage.includes('analysis')) {
      return `📊 I'd love to analyze that stock for you! However, I'm currently experiencing connectivity issues. 

Here are some key things to check when analyzing any stock:
• Technical indicators (RSI, MACD, Moving Averages)
• Support and resistance levels
• Volume trends
• Sector performance
• Recent news and events

Try asking me again in a moment! 🚀`;
    }

    if (lowerMessage.includes('market') || lowerMessage.includes('nifty')) {
      return `📈 Market insights coming up! I'm having some technical difficulties right now.

General market tips:
• Check NIFTY 50 and Bank Nifty trends
• Monitor FII/DII activity
• Keep an eye on global markets
• Watch for RBI policy updates

Please try again shortly! 💪`;
    }

    if (lowerMessage.includes('tip') || lowerMessage.includes('advice')) {
      return `💡 Here's a quick trading tip while I get back online:

"Never risk more than 2% of your capital on a single trade. Risk management is more important than being right!"

Remember: DYOR (Do Your Own Research) and trade responsibly! 🎯`;
    }

    return `🤖 I'm TradeKaro AI, your trading assistant! I'm currently experiencing some connectivity issues, but I'll be back shortly.

In the meantime, remember:
• Always use stop losses
• Don't trade with emotions
• Keep learning and practicing

Try asking me again in a moment! 🚀`;
  }

  // Generate unique ID for messages
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get conversation history
  getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  // Clear conversation history
  clearHistory(): void {
    this.conversationHistory = [];
  }

  // Get suggested questions
  getSuggestedQuestions(): string[] {
    return [
      "Analyze RELIANCE stock for me",
      "What's the market sentiment today?",
      "Give me a trading tip for beginners",
      "How do I use stop losses effectively?",
      "Which sectors are performing well?",
      "Explain technical indicators",
      "What's the best time to trade?",
      "How to manage trading psychology?"
    ];
  }
}

// Export singleton instance
const aiChatService = new AIChatService();
export default aiChatService;
export type { ChatMessage, StockAnalysisRequest, MarketContext };
