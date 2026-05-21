import {
    Bot,
    Loader2,
    MessageCircle,
    Send,
    X
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import './ChatWidget.css';

import APICall from '../../APICalls/APICall';
import MessageBubble from './components/MessageBubble';
import TypingIndicator from './components/TypingIndicator';

const ChatViqIcon = '/assets/images/favIconChatViq.svg';

const parseUTCDate = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return dateStr;
    if (!dateStr.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(dateStr)) {
        return new Date(dateStr + "Z");
    }
    return new Date(dateStr);
};

const ChatWidget = ({
    agentId,
    sessionId,   // THIS IS KEY
    mode = "agent",
    title = "Agent Chat",
    primaryColor = "#e8710a",
    setActiveSessionId
}) => {
    // const [isOpen, setIsOpen] = useState(false);
    // const [view, setView] = useState('chat'); // 'onboarding' | 'chat'
    const [messages, setMessages] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const messagesEndRef = useRef(null);
    const bodyRef = useRef(null);

    const [wsError, setWsError] = useState(null);
    const [userOnline, setUserOnline] = useState(null);

    const socketRef = useRef(null);
    const reconnectTimerRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const isMountedRef = useRef(true);
    const loadingTimeoutRef = useRef(null);
    const MAX_RECONNECT_ATTEMPTS = 8;
    const BASE_RECONNECT_DELAY_MS = 1000;

    const addMessage = (msg) => {
        setMessages(prev => [
            ...prev,
            {
                ...msg,
                _key: `${msg.sender}-${Date.now()}-${Math.random()}`
            }
        ]);
    };

    const loadHistory = useCallback(async () => {
        if (!sessionId) return;
        let found = false;
        try {
            const data = await APICall.getT(
                `/conversation/conversations?session_id=${sessionId}&per_page=200`,
            );
            const sessions = data.sessions || [];
            const convos = [];
            for (const s of sessions) {
                for (const c of (s.conversations || [])) {
                    convos.push({
                        id: c.id,
                        sender: c.sender,
                        text: c.message_text,
                        timestamp: parseUTCDate(c.created_at),
                    });
                }
            }
            if (convos.length) {
                found = true;
                setMessages(prev => {
                    const existingIds = new Set(prev.map(m => m.id));
                    const fresh = convos.filter(c => !existingIds.has(c.id));
                    return [...fresh, ...prev];
                });
            }
        } catch (err) {
            console.error("Failed to load conversation history:", err.message);
        }
        if (found) {
            setLoadingHistory(false);
        } else {
            loadingTimeoutRef.current = setTimeout(() => setLoadingHistory(false), 5000);
        }
    }, [sessionId]);

    useEffect(() => {
        loadHistory();
        return () => clearTimeout(loadingTimeoutRef.current);
    }, [loadHistory]);


    const handleSend = (e) => {
        e?.preventDefault();
        if (!inputText.trim()) return;

        const socket = socketRef.current;
        if (!socket || socket.readyState !== WebSocket.OPEN) return;

        addMessage({
            sender: "agent",
            text: inputText,
            timestamp: new Date()
        });

        socket.send(JSON.stringify({
            session_id: sessionId,
            message: inputText
        }));

        setInputText("");
        scrollToBottom(true);
    };

    const handleBotAction = (actionObj) => {
        // Add user's selection as a message
        addMessage({
            text: actionObj.label,
            sender: 'user',
            timestamp: new Date(),
            type: 'action'
        });

        const socket = socketRef.current;

        if (!socket || socket.readyState !== WebSocket.OPEN) {
            addMessage({
                sender: 'bot',
                text: 'Connection lost. Please refresh and try again.',
                timestamp: new Date()
            });
            return;
        }

        socket.send(JSON.stringify({
            session_id: sessionId,
            message: actionObj.value
        }));

        scrollToBottom(true);
        // Simulate bot response
        // setIsTyping(true);
    };

    const handleClearChat = () => {
        if (window.confirm('Clear all messages?')) {
            setMessages([]);
            setActiveSessionId('');
        }
    };

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const isInitialLoadRef = useRef(true);

    useEffect(() => {
        isInitialLoadRef.current = true;
    }, [sessionId]);

    const scrollToBottom = useCallback((force = false) => {
        setTimeout(() => {
            const body = bodyRef.current;
            if (!body) return;

            const threshold = 120;
            const isNearBottom = body.scrollHeight - body.scrollTop - body.clientHeight < threshold;

            if (force || isNearBottom) {
                body.scrollTo({
                    top: body.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }, 50);
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            if (isInitialLoadRef.current) {
                scrollToBottom(true);
                isInitialLoadRef.current = false;
            } else {
                scrollToBottom(false);
            }
        }
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (isTyping) {
            scrollToBottom(false);
        }
    }, [isTyping, scrollToBottom]);

    useEffect(() => {
        if (!agentId || !sessionId) return;

        reconnectAttemptsRef.current = 0;

        const connect = () => {
            if (!isMountedRef.current) return;

            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }

            const wsBase = import.meta.env.VITE_WS_URL;
            const socket = new WebSocket(
                `${wsBase}/chat/ws/agent/${agentId}`
            );
            socketRef.current = socket;

            socket.onopen = () => {
                reconnectAttemptsRef.current = 0;
                const token = sessionStorage.getItem("token");
                socket.send(JSON.stringify({ type: "AUTH", token }));
                setTimeout(() => {
                    if (socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({
                            type: "LOAD_SESSION",
                            session_id: parseInt(sessionId),
                        }));
                    }
                }, 300);
            };

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.error) {
                    console.error("Agent WS auth error:", data.error);
                    setWsError(data.error);
                    clearTimeout(loadingTimeoutRef.current);
                    setLoadingHistory(false);
                    reconnectAttemptsRef.current = MAX_RECONNECT_ATTEMPTS;
                    return;
                }

                // HISTORY
                if (data.type === "HISTORY" && data.session_id === parseInt(sessionId)) {
                    clearTimeout(loadingTimeoutRef.current);
                    setLoadingHistory(false);
                    setMessages(prev => {
                        const existingIds = new Set(prev.map(m => m.id));
                        const historyMessages = data.messages
                            .filter(m => !existingIds.has(m.id))
                            .map(m => ({
                                id: m.id,
                                sender: m.sender,
                                text: m.message,
                                timestamp: parseUTCDate(m.created_at),
                            }));
                        return [...historyMessages, ...prev];
                    });
                    return;
                }

                // User online/offline status
                if (data.type === "USER_STATUS" && data.session_id === parseInt(sessionId)) {
                    setUserOnline(data.is_online);
                    return;
                }

                // Normal agent/bot/system messages
                const res = data?.response;
                if (!res) return;

                const incomingSessionId = data.session_id !== undefined ? data.session_id : res.session_id;
                if (incomingSessionId !== undefined && incomingSessionId !== null && parseInt(incomingSessionId) !== parseInt(sessionId)) {
                    return;
                }

                const rawReplies = res.quick_replies || [];
                const domains = res.domains || [];
                const quickReplies = [
                    ...rawReplies,
                    ...domains.map((d, idx) => ({
                        id: `domain-${idx}`,
                        button_text: d.charAt(0).toUpperCase() + d.slice(1),
                        message_value: d.charAt(0).toUpperCase() + d.slice(1),
                        action_type: "POSTBACK"
                    }))
                ];

                addMessage({
                    sender: res.sender || "bot",
                    text: res.message,
                    quickReplies: quickReplies.length > 0 ? quickReplies : undefined,
                    timestamp: new Date()
                });
            };

            socket.onerror = (error) => {
                console.warn("Agent WS error", error);
            };

            socket.onclose = (event) => {
                if (!isMountedRef.current) return;

                if (event.code === 1008) {
                    setWsError("Session expired. Please log in again.");
                    clearTimeout(loadingTimeoutRef.current);
                    setLoadingHistory(false);
                    return;
                }

                const attempt = reconnectAttemptsRef.current;
                if (attempt >= MAX_RECONNECT_ATTEMPTS) {
                    setWsError("Connection lost. Please refresh the page.");
                    clearTimeout(loadingTimeoutRef.current);
                    setLoadingHistory(false);
                    return;
                }

                const delay = Math.min(
                    BASE_RECONNECT_DELAY_MS * Math.pow(2, attempt),
                    30000
                );
                reconnectAttemptsRef.current = attempt + 1;
                reconnectTimerRef.current = setTimeout(connect, delay);
            };
        };

        connect();

        return () => {
            isMountedRef.current = false;
            clearTimeout(reconnectTimerRef.current);
            clearTimeout(loadingTimeoutRef.current);
            if (socketRef.current) {
                socketRef.current.onclose = null;
                socketRef.current.close();
                socketRef.current = null;
            }
            isMountedRef.current = true;
        };
    }, [agentId, sessionId]);



    return (
        <div className={`chat-widget-wrapper open`}>

            {/* Launcher Button
            <button
                className="btn btn-primary rounded-circle shadow-lg p-3 bounce2 launcher-btn d-flex align-items-center justify-content-center"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: primaryColor,
                    border: 'none',
                    position: 'fixed'
                }}
                aria-label={isOpen ? "Close Chat" : "Open Chat"}
            >
                {isOpen ? <X size={24} /> : <ChatbotLaunchericon />}
            </button> */}

            {/* Chat Window */}
            {/* {isOpen && ( */}
            <div className="chat-window d-flex flex-column">

                {/* Header */}
                <div className="chat-header text-white d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3">
                        <div className="position-relative" style={{ width: 44, height: 44 }}>
                            <div className="d-flex justify-content-center align-items-center h-100 w-100" 
                                 style={{ 
                                     background: 'rgba(255, 255, 255, 0.12)', 
                                     border: '1px solid rgba(255, 255, 255, 0.2)', 
                                     borderRadius: '12px',
                                     color: '#ffffff'
                                 }}>
                                <Bot size={24} strokeWidth={2} />
                            </div>
                            <span style={{
                                width: 12, 
                                height: 12, 
                                borderRadius: '50%', 
                                display: 'inline-block',
                                backgroundColor: userOnline ? '#10B981' : '#9ca3af',
                                border: '2px solid #362e60', // dark border matching the gradient position
                                position: 'absolute',
                                bottom: -2,
                                right: -2
                            }} />
                        </div>
                        <div className="d-flex flex-column justify-content-center">
                            <h6 className="m-0 fw-bold text-white" style={{ fontSize: '0.95rem', letterSpacing: '0.2px' }}>{title}</h6>
                            <small className="opacity-90 text-white-50" style={{ fontSize: '0.72rem', marginTop: '1px' }}>
                                {userOnline === null ? 'Checking status...' : userOnline ? 'Online · Replies instantly' : 'Offline · User offline'}
                            </small>
                        </div>
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                        <button
                            className="clear-chat-btn"
                            onClick={handleClearChat}
                            title="Clear chat"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-grow-1 overflow-auto p-3 chat-body position-relative" ref={bodyRef}>
                    {loadingHistory ? (
                        <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center text-muted">
                            <Loader2 size={32} className="mb-2 opacity-50" style={{ animation: 'spin 1s linear infinite' }} />
                            <p className="mb-0">Loading conversation...</p>
                        </div>
                    ) : wsError && messages.length === 0 ? (
                        <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center text-muted">
                            <MessageCircle size={48} className="mb-3 opacity-50" />
                            <h5>Unable to load conversation</h5>
                            <p>{wsError}</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center text-muted">
                            <MessageCircle size={48} className="mb-3 opacity-50" />
                            <h5>No messages yet</h5>
                            <p>Start a conversation by sending a message</p>
                        </div>
                    ) : (
                        <div className="d-flex flex-column">
                            {messages.map((msg) => (
                                <MessageBubble key={msg._key || msg.id} message={msg} onAction={handleBotAction} />
                            ))}
                            {isTyping && <TypingIndicator />}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>


                <div className="chat-footer d-flex flex-column">
                    <form onSubmit={handleSend} className="d-flex gap-2 align-items-center w-100">
                        <div className="flex-grow-1">
                            <input
                                type="text"
                                className="chat-input rounded-pill"
                                placeholder="Type your message..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSend(e);
                                }}
                                style={{ padding: '10px 18px' }}
                            />
                        </div>
                        <button
                            type="submit"
                            className="chat-send-btn-square"
                            disabled={!inputText.trim()}
                            title="Send message"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                    <div className="chat-powered-by">
                        Powered by <span>Chatviq</span>
                    </div>
                </div>
            </div>
            {/* )} */}
        </div>
    );
};

export default ChatWidget;