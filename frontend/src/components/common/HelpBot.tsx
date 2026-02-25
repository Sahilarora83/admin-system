import { useState, useEffect, useRef } from "react";

interface Message {
    id: number;
    type: "bot" | "user";
    text: string;
    options?: string[];
    isRich?: boolean;
}

const KNOWLEDGE_BASE: Record<string, string> = {
    "cod": "To see your **COD collection**:\n1. Go to the **Dashboard**.\n2. Look at the **Cashflow Insights** card.\n3. It shows 'Amount Saved' which is your total delivered COD value.",
    "ship": "Shipping is easy:\n1. Navigate to the **Orders** page.\n2. Click the **Dispatch** button next to an order.\n3. Enter package dimensions.\n4. Select your preferred courier and hit **Confirm**.",
    "risk": "Our AI uses a 4-layer weighted logic:\n- **40%** Customer RTO history.\n- **30%** Pincode historical risk.\n- **20%** Courier performance in that zone.\n- **10%** Order value.\nHigh scores will trigger a 'Suggest Prepaid' warning.",
    "rto": "RTO (Return to Origin) Rate is the % of orders that were undelivered. You can track this in the **RTO Metrics** card on the main dashboard.\n\nTip: High RTO pincodes are automatically flagged with ⚠ icons.",
    "shopify": "1. Click the **Connect Shopify** button on the Orders page.\n2. Enter your store URL.\n3. Authorize the RTOShield app to start syncing orders automatically.",
    "courier": "You can analyze courier performance in the **Courier Analysis** page (Sidebar -> Courier Analysis).\nIt shows the delivery funnel and RTO rates per courier.",
    "hello": "Hello! I am your RTOShield AI assistant. You can ask me about COD collections, shipping orders, or RTO risk management.",
    "help": "I can help you with:\n- Viewing COD collection\n- Shipping/Dispatching orders\n- Understanding RTO Risk scores\n- Connecting Shopify\n- Courier performance analysis"
};

const QUICK_QUESTIONS = [
    "How can I see the COD collection?",
    "How to ship an order?",
    "How is COD Risk calculated?",
    "Tell me about RTO Rate"
];

export default function HelpBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [userInput, setUserInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            type: "bot",
            text: "Hello! I'm your RTOShield AI assistant. I can help you navigate the system and understand your data. What's on your mind?",
            options: QUICK_QUESTIONS
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const findAnswer = (input: string) => {
        const lowerInput = input.toLowerCase();

        // Exact match for options
        if (KNOWLEDGE_BASE[input]) return KNOWLEDGE_BASE[input];

        // Keyword matching
        for (const key in KNOWLEDGE_BASE) {
            if (lowerInput.includes(key)) {
                return KNOWLEDGE_BASE[key];
            }
        }

        return "I'm sorry, I couldn't find a specific answer for that. You can ask about **COD**, **Shipping**, **RTO Risk**, or **Shopify Connection**.";
    };

    const handleSend = (text: string) => {
        if (!text.trim()) return;

        const userMsg: Message = { id: Date.now(), type: "user", text };
        setMessages(prev => [...prev, userMsg]);
        setUserInput("");
        setIsTyping(true);

        setTimeout(() => {
            const answer = findAnswer(text);
            const botMsg: Message = {
                id: Date.now() + 1,
                type: "bot",
                text: answer,
                options: ["View Main Topics"]
            };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 1000);
    };

    const handleOptionClick = (option: string) => {
        if (option === "View Main Topics") {
            setMessages(prev => [...prev, {
                id: Date.now(),
                type: "bot",
                text: "Here are the main topics I can help with:",
                options: QUICK_QUESTIONS
            }]);
            return;
        }
        handleSend(option);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-sans">
            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[320px] sm:w-[400px] h-[550px] bg-white dark:bg-gray-900 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/20 dark:border-gray-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 fade-in duration-500 backdrop-blur-xl bg-opacity-95">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-6 pb-8 text-white relative">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-purple-600 rounded-full"></span>
                            </div>
                            <div>
                                <h3 className="font-extrabold text-xl tracking-tight">RTOShield One</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <p className="text-purple-100 text-[10px] font-bold uppercase tracking-widest">Active Assistant</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="absolute -bottom-6 left-0 w-full px-6 flex gap-2">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-[10px] font-medium text-white/90 shadow-sm">
                                🚀 Instant Help
                            </div>
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-[10px] font-medium text-white/90 shadow-sm">
                                🧠 AI Insights
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-transparent scroll-smooth pt-10">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] group ${msg.type === "user" ? "items-end" : "items-start"} flex flex-col gap-1.5`}>
                                    <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-sm transition-all ${msg.type === "user"
                                        ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-tr-none"
                                        : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700/50 rounded-tl-none font-medium"
                                        }`}>
                                        <div className="whitespace-pre-line prose prose-sm dark:prose-invert max-w-none">
                                            {msg.text.split('**').map((part, i) => i % 2 === 1 ? <b key={i} className="text-indigo-600 dark:text-indigo-400 font-bold">{part}</b> : part)}
                                        </div>
                                    </div>

                                    {msg.options && (
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {msg.options.map((opt) => (
                                                <button
                                                    key={opt}
                                                    onClick={() => handleOptionClick(opt)}
                                                    className="text-xs py-2 px-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 font-semibold transition-all hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:scale-[1.02] active:scale-95"
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700 flex gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend(userInput);
                            }}
                            className="bg-gray-100/80 dark:bg-gray-800/80 rounded-2xl p-1.5 flex items-center gap-2 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all border border-gray-200 dark:border-gray-700"
                        >
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="Type your question..."
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-3 text-gray-800 dark:text-gray-200"
                            />
                            <button
                                type="submit"
                                disabled={!userInput.trim() || isTyping}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${!userInput.trim() || isTyping
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-600/20 active:scale-95"
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-[0_15px_35px_rgba(79,70,229,0.3)] transition-all duration-500 hover:scale-110 active:scale-95 group ${isOpen
                    ? "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                    : "bg-gradient-to-br from-purple-600 via-indigo-600 to-indigo-700 text-white"
                    }`}
            >
                {isOpen ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <div className="relative">
                        <svg className="w-8 h-8 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="absolute -top-3 -right-3 flex h-6 w-6">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-6 w-6 bg-pink-500 border-2 border-white dark:border-gray-800 flex items-center justify-center text-[10px] font-bold">1</span>
                        </span>
                    </div>
                )}
            </button>
        </div>
    );
}
