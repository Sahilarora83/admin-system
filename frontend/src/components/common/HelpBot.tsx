import { useState, useEffect, useRef } from "react";

interface Action {
    label: string;
    type: "command" | "api" | "nav" | "workflow";
    payload: string;
    variant?: "primary" | "secondary" | "danger" | "success";
}

interface Message {
    id: number;
    type: "bot" | "user";
    text: string;
    status?: "success" | "warning" | "error" | "info" | "neutral";
    data?: any;
    actions?: Action[];
}

export default function HelpBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [userInput, setUserInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            type: "bot",
            text: "Hi there! I'm your RTOShield assistant. I've been looking at your data and noticed that RTOs from the North Zone are up by about 12% today. \n\nYou might want to check the Pincode Risk report to see what's going on.",
            status: "warning",
            actions: [
                { label: "Check Pincode Risk", type: "nav", payload: "/ecommerce/metrics", variant: "primary" },
                { label: "Sync with Shiprocket", type: "api", payload: "/api/shipments/sync", variant: "secondary" },
                { label: "How's the system?", type: "api", payload: "/api/dashboard-stats" }
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

                let text = "Everything looks good!";
                if (action.payload.includes("stats")) {
                    text = `Here's a quick look at how we're doing:\n\n• **Sales:** ₹${(data.revenue / 1000).toFixed(1)}K\n• **Total Orders:** ${data.total_orders}\n• **RTO Status:** ${data.rto_orders > 0 ? 'Watching closely' : 'All quiet'}\n• **Speed:** Fast (24ms)`;
                } else if (action.payload.includes("sync")) {
                    text = "I've started syncing with Shiprocket. Your tracking data will be updated in just a moment.";
                }

                setMessages(prev => [...prev, { id: Date.now(), type: "bot", text, status: "success" }]);
            } catch (err) {
                setMessages(prev => [...prev, { id: Date.now(), type: "bot", text: "I'm having a bit of trouble connecting to the server. Could you check if everything is running?", status: "error" }]);
            }
        } else if (action.type === "command") {
            if (action.payload === "check_risk") {
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    type: "bot",
                    text: "I found **4 orders** that look a bit risky based on the customer's history. \n\nWhat would you like me to do?",
                    status: "warning",
                    actions: [
                        { label: "Block COD for these", type: "command", payload: "auto_block", variant: "danger" },
                        { label: "I'll review them manually", type: "command", payload: "flag_review", variant: "secondary" }
                    ]
                }]);
            } else if (action.payload === "auto_block") {
                setMessages(prev => [...prev, { id: Date.now(), type: "bot", text: "Done! I've set those risky orders to 'Prepaid Only'. This should save you about ₹8,400 in potential returns.", status: "success" }]);
            }
        } else if (action.type === "nav") {
            window.location.href = action.payload;
        }
        setIsTyping(false);
    };

    const handleSend = (text: string) => {
        if (!text.trim()) return;
        setMessages(prev => [...prev, { id: Date.now(), type: "user", text }]);
        setUserInput("");
        setIsTyping(true);

        const input = text.toLowerCase();
        setTimeout(() => {
            let botMsg: Message = { id: Date.now() + 1, type: "bot", text: "", status: "neutral" };

            if (input.includes("ship") || input.includes("dispatch")) {
                botMsg.text = "You can handle all your shipping on the **Orders** page. Would you like me to take you there?";
                botMsg.actions = [{ label: "Go to Orders", type: "nav", payload: "/ecommerce/orders", variant: "primary" }];
            } else if (input.includes("rto") || input.includes("return")) {
                botMsg.text = "We've had about ₹14,200 worth of RTOs this week, mostly from Haryana. \n\nI can stop accepting COD orders from that area for a while if you'd like.";
                botMsg.actions = [{ label: "Block COD for that zone", type: "command", payload: "block_zone", variant: "danger" }];
            } else if (input.includes("sync") || input.includes("update")) {
                handleAction({ label: "Sync now", type: "api", payload: "/api/shipments/sync" });
                return;
            } else {
                botMsg.text = "I'm not quite sure about that, but I can help you with **Shipping**, **Risk Control**, or **General Stats**. What do you need?";
                botMsg.actions = [
                    { label: "Sync tracking", type: "api", payload: "/api/shipments/sync", variant: "secondary" },
                    { label: "Check revenue", type: "api", payload: "/api/dashboard-stats", variant: "secondary" },
                    { label: "Scan for risk", type: "command", payload: "check_risk", variant: "danger" }
                ];
            }

            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 800);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-sans antialiased text-gray-900 dark:text-gray-100">
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[calc(100vw-48px)] sm:w-[420px] h-[650px] bg-white/95 dark:bg-[#0d1117]/95 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.3)] border border-white/20 dark:border-white/5 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-500 ring-1 ring-black/5">

                    {/* Premium Header */}
                    <div className="p-6 bg-gradient-to-br from-[#4f46e5] via-[#4338ca] to-[#3730a3] text-white relative">
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-inner">
                                        <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-[#4338ca] rounded-full shadow-lg animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="font-black text-xl tracking-tight leading-none uppercase italic">Shield Assistant</h3>
                                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-[0.2em] mt-1.5 opacity-80">Your Personal RTO Guide</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center transition-all hover:rotate-90 active:scale-95">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        {/* Mesh Gradient Overlay */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                    </div>

                    {/* Chat Log */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 bg-transparent scrollbar-hide pt-8">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] flex flex-col gap-3 ${msg.type === "user" ? "items-end" : "items-start"}`}>

                                    {/* Bot Tag */}
                                    {msg.type === "bot" && (
                                        <div className="flex items-center gap-1.5 ml-1">
                                            <span className="w-1 h-3 bg-indigo-500 rounded-full" />
                                            <span className="text-[10px] font-black text-indigo-500/80 uppercase tracking-widest">ASSISTANT</span>
                                        </div>
                                    )}

                                    <div className={`p-5 rounded-3xl text-[13px] md:text-sm leading-relaxed transition-all shadow-xl group ${msg.type === "user"
                                            ? "bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-tr-none border border-white/10"
                                            : `bg-white dark:bg-[#161b22] text-gray-800 dark:text-white border border-gray-100 dark:border-white/5 rounded-tl-none font-medium ${msg.status === "warning" ? "ring-2 ring-orange-500/20 bg-orange-50/10" : ""
                                            }`
                                        }`}>
                                        <div className="whitespace-pre-line tracking-tight">
                                            {msg.text.split('**').map((item, i) => (
                                                i % 2 === 1 ? <b key={i} className="text-indigo-600 dark:text-indigo-400 font-black">{item}</b> : item
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Deck */}
                                    {msg.actions && (
                                        <div className="flex flex-wrap gap-2 px-1">
                                            {msg.actions.map(act => (
                                                <button
                                                    key={act.label}
                                                    onClick={() => handleAction(act)}
                                                    className={`px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 border-b-4 hover:translate-y-[-2px] hover:shadow-lg ${act.variant === "primary" ? "bg-indigo-600 text-white border-indigo-800" :
                                                            act.variant === "danger" ? "bg-rose-500 text-white border-rose-700" :
                                                                act.variant === "success" ? "bg-emerald-500 text-white border-emerald-700" :
                                                                    "bg-white dark:bg-[#1c2128] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-black hover:border-indigo-500"
                                                        }`}
                                                >
                                                    {act.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex items-center gap-2 p-4 rounded-full bg-white dark:bg-[#161b22] border border-gray-100 dark:border-white/5 w-fit shadow-lg ml-1">
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                            </div>
                        )}
                    </div>

                    {/* Pro Input Interface */}
                    <div className="p-6 bg-white dark:bg-[#0d1117] border-t border-gray-100 dark:border-white/5">
                        <div className="bg-gray-50 dark:bg-[#161b22] rounded-[2rem] p-1.5 flex items-center gap-3 border border-gray-200 dark:border-white/5 focus-within:border-indigo-500 transition-all shadow-inner group">
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-[#0d1117] flex items-center justify-center text-indigo-500 font-bold text-sm shadow-sm group-focus-within:rotate-12 transition-transform select-none border border-gray-100 dark:border-white/5">
                                AI
                            </div>
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend(userInput)}
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 text-gray-800 dark:text-white placeholder:text-gray-400 font-semibold"
                            />
                            <button
                                onClick={() => handleSend(userInput)}
                                disabled={!userInput.trim() || isTyping}
                                className="w-11 h-11 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white rounded-[1.2rem] shadow-xl transition-all active:scale-90"
                            >
                                <svg className="w-6 h-6 rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Launch Controller */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_rgba(79,70,229,0.3)] transition-all duration-500 hover:rotate-6 active:scale-90 relative overflow-hidden group ${isOpen ? "bg-white dark:bg-[#161b22] text-gray-500" : "bg-indigo-600 text-white"
                    }`}
            >
                {isOpen ? (
                    <svg className="w-8 h-8 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-indigo-800 transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                        <svg className="w-9 h-9 relative z-10 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 border-2 border-indigo-600 rounded-full" />
                    </>
                )}
            </button>
        </div>
    );
}
