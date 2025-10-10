'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    MessageSquare,
    Send,
    Bot,
    User,
    Sparkles,
    TrendingUp,
    AlertTriangle,
    Lightbulb,
    BarChart3
} from 'lucide-react';

// Mock AI insights
const aiInsights = [
    {
        id: '1',
        title: 'Portfolio Concentration Risk',
        description: 'Your IT sector allocation (35%) is above recommended diversification limits. Consider rebalancing.',
        type: 'warning',
        icon: <AlertTriangle className="w-4 h-4" />
    },
    {
        id: '2',
        title: 'Strong Performance',
        description: 'Your portfolio is outperforming Nifty 50 by 3.2% over the last 6 months.',
        type: 'analysis',
        icon: <TrendingUp className="w-4 h-4" />
    },
    {
        id: '3',
        title: 'Defensive Stocks Opportunity',
        description: 'Consider adding defensive stocks like FMCG during current market volatility.',
        type: 'opportunity',
        icon: <Lightbulb className="w-4 h-4" />
    },
    {
        id: '4',
        title: 'Stock Recommendation',
        description: 'Based on your risk profile, ICICI Bank shows strong fundamentals and technical indicators.',
        type: 'recommendation',
        icon: <BarChart3 className="w-4 h-4" />
    }
];

// Mock conversation data
const initialMessages = [
    {
        id: '1',
        type: 'ai',
        content: 'Hello! I\'m your AI portfolio advisor. I can help you analyze your investments, answer financial questions, and provide personalized recommendations. How can I assist you today?',
        timestamp: new Date(),
        suggestions: [
            'Analyze my portfolio performance',
            'What stocks should I buy?',
            'How is my risk exposure?',
            'Compare with market benchmarks'
        ]
    }
];

// Mock AI responses
const getAIResponse = (userMessage) => {
    const message = userMessage.toLowerCase();

    if (message.includes('performance') || message.includes('analyze')) {
        return 'Based on your portfolio analysis, you\'ve achieved a 25% return over the past 6 months, outperforming the Nifty 50 by 3.2%. Your Sharpe ratio of 1.34 indicates good risk-adjusted returns. However, I notice high concentration in IT stocks (35% allocation). Consider diversifying into other sectors like banking or pharmaceuticals to reduce concentration risk.';
    }

    if (message.includes('buy') || message.includes('stock') || message.includes('recommend')) {
        return 'Based on your current portfolio and risk profile, I recommend considering:\n\n1. **ICICI Bank** - Strong fundamentals, trading below fair value\n2. **Hindustan Unilever** - Defensive FMCG stock for stability\n3. **Asian Paints** - Good growth prospects in the decorative paints sector\n\nThese recommendations aim to diversify your sector allocation while maintaining your growth-oriented approach.';
    }

    if (message.includes('risk') || message.includes('exposure')) {
        return 'Your current risk profile shows:\n\n• **Portfolio Beta**: 1.02 (slightly more volatile than market)\n• **Max Drawdown**: -6.7% (within acceptable limits)\n• **Volatility**: 22.3% (moderate risk)\n• **Sector Concentration**: High in IT (35%)\n\nRecommendation: Consider reducing IT exposure to 25% and adding defensive sectors like FMCG or utilities to balance risk.';
    }

    if (message.includes('benchmark') || message.includes('compare') || message.includes('market')) {
        return 'Your portfolio comparison with benchmarks:\n\n**vs Nifty 50:**\n• Your return: +25.0%\n• Nifty 50: +21.8%\n• Outperformance: +3.2%\n\n**vs Sensex:**\n• Your return: +25.0%\n• Sensex: +23.1%\n• Outperformance: +1.9%\n\nYou\'re consistently outperforming both major indices, which is excellent! The key drivers are your IT stock selection and timing.';
    }

    return 'I understand your question about ' + userMessage + '. Based on your portfolio data and current market conditions, I\'d recommend reviewing your asset allocation and considering the insights I\'ve provided above. Would you like me to elaborate on any specific aspect of your portfolio?';
};

export default function AIChat() {
    const [messages, setMessages] = useState(initialMessages);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (content) => {
        if (!content.trim()) return;

        const userMessage = {
            id: Date.now().toString(),
            type: 'user',
            content,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        // Simulate AI processing delay
        setTimeout(() => {
            const aiResponse = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: getAIResponse(content),
                timestamp: new Date(),
                suggestions: [
                    'Tell me more about sector allocation',
                    'Show me stock recommendations',
                    'Analyze risk metrics',
                    'Compare with peers'
                ]
            };

            setMessages(prev => [...prev, aiResponse]);
            setIsLoading(false);
        }, 1500);
    };

    const handleSuggestionClick = (suggestion) => {
        handleSendMessage(suggestion);
    };

    const getInsightIcon = (type) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            case 'recommendation': return <BarChart3 className="w-4 h-4 text-blue-500" />;
            case 'opportunity': return <Lightbulb className="w-4 h-4 text-green-500" />;
            default: return <TrendingUp className="w-4 h-4 text-purple-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">AI Portfolio Insights</h1>
                    <p className="text-muted-foreground">Get personalized investment advice and analysis</p>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI Powered
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* AI Insights Panel */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Key Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {aiInsights.map((insight) => (
                            <div key={insight.id} className="p-3 rounded-lg border bg-card">
                                <div className="flex items-start gap-2">
                                    {getInsightIcon(insight.type)}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm">{insight.title}</h4>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {insight.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Chat Interface */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            AI Assistant
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea ref={scrollAreaRef} className="h-96 p-4">
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'
                                            }`}
                                    >
                                        {message.type === 'ai' && (
                                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                                <Bot className="w-4 h-4 text-primary-foreground" />
                                            </div>
                                        )}

                                        <div
                                            className={`max-w-[80%] rounded-lg p-3 ${message.type === 'user'
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted'
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-line">{message.content}</p>
                                            <p className="text-xs opacity-70 mt-1">
                                                {message.timestamp.toLocaleTimeString()}
                                            </p>

                                            {message.suggestions && (
                                                <div className="mt-3 pt-2 border-t border-border/20">
                                                    <p className="text-xs opacity-70 mb-2">Suggested questions:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {message.suggestions.map((suggestion, index) => (
                                                            <Button
                                                                key={index}
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-xs h-6"
                                                                onClick={() => handleSuggestionClick(suggestion)}
                                                            >
                                                                {suggestion}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {message.type === 'user' && (
                                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                                                <User className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex gap-3 justify-start">
                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                            <Bot className="w-4 h-4 text-primary-foreground" />
                                        </div>
                                        <div className="bg-muted rounded-lg p-3">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        <Separator />

                        <div className="p-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Ask about your portfolio, market trends, or investment advice..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage(inputValue);
                                        }
                                    }}
                                    disabled={isLoading}
                                />
                                <Button
                                    onClick={() => handleSendMessage(inputValue)}
                                    disabled={isLoading || !inputValue.trim()}
                                    size="sm"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                AI responses are based on your portfolio data and general market analysis.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Stock Recommendations */}
            <Card>
                <CardHeader>
                    <CardTitle>AI-Powered Stock Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg border bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <h3 className="font-medium">ICICI Bank</h3>
                                <Badge variant="outline" className="text-xs">BUY</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                                Strong fundamentals, trading below fair value. Good addition to banking sector.
                            </p>
                            <div className="flex justify-between text-xs">
                                <span>Target: ₹1,050</span>
                                <span className="text-green-600">+12% potential</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                            <div className="flex items-center gap-2 mb-2">
                                <BarChart3 className="w-4 h-4 text-blue-600" />
                                <h3 className="font-medium">Hindustan Unilever</h3>
                                <Badge variant="outline" className="text-xs">BUY</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                                Defensive FMCG stock with consistent dividend yield and growth prospects.
                            </p>
                            <div className="flex justify-between text-xs">
                                <span>Target: ₹2,750</span>
                                <span className="text-blue-600">+8% potential</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-lg border bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Lightbulb className="w-4 h-4 text-purple-600" />
                                <h3 className="font-medium">Asian Paints</h3>
                                <Badge variant="outline" className="text-xs">HOLD</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                                Market leader in paints, good for long-term growth with rural recovery.
                            </p>
                            <div className="flex justify-between text-xs">
                                <span>Target: ₹3,200</span>
                                <span className="text-purple-600">+6% potential</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}