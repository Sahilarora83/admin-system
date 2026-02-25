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
    component?: React.ReactNode;
}

const KNOWLEDGE_BASE: Record<string, string> = {
    "how to ship": "To ship an order:\n1. Go to **Orders**\n2. Click **Dispatch**\n3. Select Courier & Confirm.",
    "cod collection": "Your COD collection can be seen in the **Cashflow** section of the dashboard. It calculates delivered COD versus pending.",
    "risk logic": "RTO Risk = 40% Customer History + 30% Pincode + 20% Courier + 10% Order Value.",
};

export default function HelpBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [userInput, setUserInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            type: "bot",
            text: "System Online. I am RTOShield Commander. I can perform actions or answer your queries. Type '/' to see commands.",
            actions: [
                { label: "Sync Tracking", type: "api", payload: "/api/shipments/sync" },
                { label: "Check Risk Orders", type: "command", payload: "check_risk" },
                { label: "System Health", type: "api", payload: "/api/dashboard-stats" }
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
        if (action.type === "api") {
            setIsTyping(true);
            try {
                const res = await fetch(action.payload);
                const data = await res.json();

                let responseText = "Action completed successfully.";
                if (action.payload.includes("stats")) {
                    responseText = `System Status:\n- Total Orders: ${data.total_orders}\n- COD: ${data.cod_orders}\n- RTO: ${data.rto_orders}`;
                } else if (action.payload.includes("sync")) {
                    responseText = "Tracking synchronization initiated. All AWB statuses are being updated from Shiprocket...";
                }

                setMessages(prev => [...prev, {
                    id: Date.now(),
                    type: "bot",
                    text: responseText
                }]);
            } catch (err) {
                setMessages(prev => [...prev, { id: Date.now(), type: "bot", text: "Failed to connect to system API." }]);
            }
            setIsTyping(false);
        } else if (action.type === "command") {
            setIsTyping(true);
            setTimeout(() => {
                if (action.payload === "check_risk") {
                    setMessages(prev => [...prev, {
                        id: Date.now(),
                        type: "bot",
                        text: "Found **3 High Risk** orders pending dispatch. I recommend blocking COD for these.",
                        actions: [{ label: "Auto-Block All High Risk", type: "command", payload: "auto_block" }]
                    }]);
                } else if (action.payload === "auto_block") {
                    setMessages(prev => [...prev, {
                        id: Date.now(),
                        type: "bot",
                        text: "Done! I've automatically suggested 'Prepaid Only' for all detected high-risk orders and blocked known fraud customer accounts. Dashboard updated."
                    }]);
                }
                setIsTyping(false);
            }, 1000);
        }
    };

    const handleSend = (text: string) => {
        if (!text.trim()) return;
        const normalized = text.toLowerCase();
        setMessages(prev => [...prev, { id: Date.now(), type: "user", text }]);
        setUserInput("");
        setIsTyping(true);

        setTimeout(async () => {
            let botMsg: Message = { id: Date.now() + 1, type: "bot", text: "" };

            if (normalized === "/sync") {
                handleAction({ label: "Sync", type: "api", payload: "/api/shipments/sync" });
                setIsTyping(false);
                return;
            }

            if (normalized.includes("risk") || normalized === "/check") {
                botMsg.text = "I've analyzed your pending orders. 5 orders have a risk score above 70%. Would you like to see them?";
                botMsg.actions = [{ label: "View Risk Orders", type: "command", payload: "check_risk" }];
            } else if (normalized.includes("cod") || normalized.includes("money")) {
                botMsg.text = KNOWLEDGE_BASE["cod collection"];
            } else if (normalized.includes("ship") || normalized.includes("dispatch")) {
                botMsg.text = KNOWLEDGE_BASE["how to ship"];
            } else {
                botMsg.text = "Command not recognized. Try asking about 'COD', 'Shipping', or 'Risk'. Or use /sync.";
            }

            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 800);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[350px] sm:w-[420px] h-[600px] bg-[#0c1015]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                    {/* Command Header */}
                    <div className="p-6 bg-gradient-to-b from-blue-600/20 to-transparent border-b border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black tracking-tighter text-xl">COMMANDER OS</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">System Interface v2.0</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Quick Stats Banner */}
                        <div className="mt-4 flex gap-2">
                            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1.5">
                                <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                                <span className="text-[9px] font-bold text-emerald-400 uppercase">Tracking Sync: OK</span>
                            </div>
                            <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center gap-1.5">
                                <div className="w-1 h-1 bg-blue-500 rounded-full" />
                                <span className="text-[9px] font-bold text-blue-400 uppercase">Risk Engine: Live</span>
                            </div>
                        </div>
                    </div>

                    {/* Console View */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide pt-2">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] flex flex-col gap-2 ${msg.type === "user" ? "items-end" : "items-start"}`}>
                                    <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed border shadow-lg ${msg.type === "user"
                                        ? "bg-blue-600 border-blue-500 text-white rounded-tr-none"
                                        : "bg-[#161b22] border-white/5 text-gray-300 rounded-tl-none"
                                        }`}>
                                        <div className="font-mono text-[13px] whitespace-pre-line tracking-tight">
                                            {msg.text}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {msg.actions && (
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {msg.actions.map(act => (
                                                <button
                                                    key={act.label}
                                                    onClick={() => handleAction(act)}
                                                    className="px-4 py-2 bg-blue-600/10 border border-blue-500/30 rounded-xl text-blue-400 text-xs font-bold hover:bg-blue-600 hover:text-white transition-all transform hover:scale-105 active:scale-95"
                                                >
                                                    {act.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {msg.options && (
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {msg.options.map(opt => (
                                                <button key={opt} onClick={() => handleSend(opt)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 text-xs font-medium hover:bg-white/10 transition-all">
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
                                <div className="bg-[#161b22] p-4 rounded-2xl border border-white/5 flex gap-1.5">
                                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping" />
                                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping [animation-delay:-0.1s]" />
                                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping [animation-delay:-0.2s]" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dark Input Terminal */}
                    <div className="p-4 bg-[#0c1015] border-t border-white/5">
                        <div className="bg-[#161b22] rounded-2xl p-1.5 flex items-center gap-2 border border-white/5 group focus-within:border-blue-500/50 transition-all">
                            <div className="pl-3 text-blue-500 font-mono text-sm font-bold opacity-50 group-focus-within:opacity-100">$</div>
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend(userInput)}
                                placeholder="Type command... (e.g. /sync)"
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-1 text-gray-300 placeholder:text-gray-600 font-mono"
                            />
                            <button
                                onClick={() => handleSend(userInput)}
                                disabled={!userInput.trim() || isTyping}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${userInput.trim() ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]" : "bg-white/5 text-gray-600"
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Futuristic Floating Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 hover:rotate-12 active:scale-90 relative ${isOpen ? "bg-[#161b22] text-white border border-white/10" : "bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_50px_rgba(37,99,235,0.6)]"
                    }`}
            >
                {isOpen ? (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                    <>
                        <div className="absolute inset-0 rounded-3xl border-2 border-white/20 animate-ping opacity-20 scale-125" />
                        <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </>
                )}
            </button>
        </div>
    );
}
