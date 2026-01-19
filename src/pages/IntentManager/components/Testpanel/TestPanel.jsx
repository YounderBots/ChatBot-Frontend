import React, { useState, useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";

const createMessage = (role, text, actions = []) => ({
    id: crypto.randomUUID(),
    role,
    text,
    actions
});

const TestPanel = ({ isOpen, onClose }) => {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const bodyRef = useRef(null);

    /**
     * Mock API (replace later)
     */
    const sendMessage = async (userText) => {
        return new Promise((resolve) =>
            setTimeout(() => {
                resolve({
                    text: "Our team will get back to you soon.",
                    actions: ["Track Order", "Pricing", "Talk to Agent"]
                });
            }, 500)
        );
    };

    const handleSend = useCallback(async () => {
        if (!input.trim()) return;

        const userMsg = createMessage("user", input);
        setMessages((prev) => [...prev, userMsg]);
        setInput("");

        const botResponse = await sendMessage(input);
        const botMsg = createMessage(
            "bot",
            botResponse.text,
            botResponse.actions
        );

        setMessages((prev) => [...prev, botMsg]);
    }, [input]);

    /** Auto scroll to bottom */
    useEffect(() => {
        bodyRef.current?.scrollTo({
            top: bodyRef.current.scrollHeight,
            behavior: "smooth"
        });
    }, [messages]);

    if (!isOpen) return null;

    return (
        <div className="support-bot open">
            {/* Header */}
            <div className="support-header">
                <div className="d-flex align-items-center gap-2">
                     <span>Support Bot</span>
                </div>
                <X size={18} onClick={onClose} className="cursor-pointer" />
            </div>

            {/* Chat Body */}
            <div className="support-body" ref={bodyRef}>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`message ${msg.role === "user" ? "user" : "bot"}`}
                    >
                        <p className="mb-2">{msg.text}</p>

                        {msg.actions?.length > 0 && (
                            <div className="quick-actions">
                                {msg.actions.map((a) => (
                                    <button key={a}>{a}</button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className="support-input">
                <input
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button onClick={handleSend}>Send</button>
            </div>
        </div>
    );
};

export default TestPanel;
