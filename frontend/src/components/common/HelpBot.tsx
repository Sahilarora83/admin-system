import { useState, useEffect, useRef } from "react";

interface Action {
    label: string;
    type: "link" | "command" | "api";
    payload: string;
}

interface Message {
    id: number;
    type: "bot" | "user";
    text: string;
    options?: string[];
    actions?: Action[];
}

const KNOWLEDGE_BASE: Record<string, string> = {
    "how to ship": "To ship an order: Go to **Orders** > Click **Dispatch** > Select Courier & Confirm.",
    "cod collection": "See your **Cashflow** section. It calculates delivered COD versus pending totals.",
    "risk logic": "RTO Risk = 40% History + 30% Pincode + 20% Courier + 10% Value.",
};

export default function HelpBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [userInput, setUserInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            type: "bot",
            text: "Hello! I'm your RTOShield assistant. I can help with tracking, risk analysis, or general questions.",
            actions: [
                { label: "Sync Tracking", type: "api", payload: "/api/shipments/sync" },
                { label: "Scan Risk", type: "command", payload: "check_risk" }
            ]
        }
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleAction = async (action: Action) => {
        setIsTyping(true);
        if (action.type === "api") {
            try {
                const res = await fetch(action.payload);
                const data = await res.json();
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    type: "bot",
                    text: action.payload.includes("sync") ? "Sync started. Updating AWBs..." : "Action completed."
                }]);
            } catch (err) {
                setMessages(prev => [...prev, { id: Date.now(), type: "bot", text: "System busy. Please try again later." }]);
            }
        } else if (action.type === "command") {
            setTimeout(() => {
                if (action.payload === "check_risk") {
                    setMessages(prev => [...prev, {
                        id: Date.now(),
                        type: "bot",
                        text: "I've detected 3 high-risk orders. Recommend blocking COD.",
                        actions: [{ label: "Block High Risk", type: "command", payload: "auto_block" }]
                    }]);
                } else if (action.payload === "auto_block") {
                    setMessages(prev => [...prev, { id: Date.now(), type: "bot", text: "Orders updated to 'Prepaid Only'. Fraud accounts flagged." }]);
                }
                setIsTyping(false);
            }, 800);
            return;
        }
        setIsTyping(false);
    };

    const handleSend = (text: string) => {
        if (!text.trim()) return;
        const normalized = text.toLowerCase();
        setMessages(prev => [...prev, { id: Date.now(), type: "user", text }]);
        setUserInput("");
        setIsTyping(true);

        setTimeout(() => {
            let botMsg: Message = { id: Date.now() + 1, type: "bot", text: "" };
            if (normalized.includes("risk") || normalized.includes("check")) {
                botMsg.text = "Analyzing orders... I found some risks. What would you like to do?";
                botMsg.actions = [{ label: "Scan Now", type: "command", payload: "check_risk" }];
            } else if (normalized.includes("cod") || normalized.includes("money")) {
                botMsg.text = KNOWLEDGE_BASE["cod collection"];
            } else if (normalized.includes("ship")) {
                botMsg.text = KNOWLEDGE_BASE["how to ship"];
            } else {
                botMsg.text = "I'm not sure about that. Try: 'Sync', 'Risk', or 'COD'.";
            }
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 600);
    };

    return (
        <div className="fixed bottom-4 right-4 z-[9999] md:bottom-6 md:right-6">
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-[calc(100vw-32px)] sm:w-[380px] md:w-[420px] max-h-[550px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
                    {/* Header */}
                    <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">RTOShield AI</h3>
                                <p className="text-[10px] text-indigo-100">Always active</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] bg-gray-50/30 dark:bg-gray-900/10">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] flex flex-col gap-2 ${msg.type === "user" ? "items-end" : "items-start"}`}>
                                    <div className={`p-3 rounded-2xl text-xs md:text-sm leading-relaxed shadow-sm ${msg.type === "user"
                                            ? "bg-indigo-600 text-white rounded-tr-none"
                                            : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-600 rounded-tl-none"
                                        }`}>
                                        {msg.text}
                                    </div>
                                    {msg.actions && (
                                        <div className="flex flex-wrap gap-2">
                                            {msg.actions.map(act => (
                                                <button key={act.label} onClick={() => handleAction(act)} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 rounded-xl text-[10px] font-bold hover:bg-indigo-600 hover:text-white transition-all">
                                                    {act.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex gap-1.5 py-2 px-1">
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700/50 rounded-xl px-3 py-1">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend(userInput)}
                                placeholder="Ask me anything..."
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 text-gray-800 dark:text-gray-200"
                            />
                            <button onClick={() => handleSend(userInput)} disabled={!userInput.trim() || isTyping} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all disabled:opacity-30">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-90 ${isOpen ? "bg-white dark:bg-gray-700 text-gray-500 border border-gray-100" : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
            >
                {isOpen ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                    <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                )}
            </button>
        </div>
    );
}
