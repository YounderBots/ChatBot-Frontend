import {
    Image as ImageIcon,
    MessageCircle,
    Mic,
    Paperclip,
    Send,
    X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import './ChatWidget.css';

import MessageBubble from './components/MessageBubble';
import TypingIndicator from './components/TypingIndicator';

const ChatViqIcon = '/assets/images/favIconChatViq.svg';

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
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [attachment, setAttachment] = useState(null);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const socketRef = useRef(null);
    const reconnectTimerRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const isMountedRef = useRef(true);
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

        // Simulate bot response
        // setIsTyping(true);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setAttachment({
                type: 'image',
                src: reader.result,
                name: file.name,
                size: file.size
            });
        };
        reader.readAsDataURL(file);
    };


    const handleVoiceRecord = async () => {
        if (isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);

                addMessage({
                    sender: 'user',
                    type: 'voice',
                    audio: {
                        src: audioUrl
                    },
                    timestamp: new Date()
                });

                // simulateBotResponse('[Voice message]');
                socketRef.current?.send(JSON.stringify({
                    type: "VOICE",
                    message: "Voice message sent"
                }));
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.warn('Microphone access denied:', err.message);
        }
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
            };

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);

                // HISTORY
                if (data.type === "HISTORY" && data.session_id === parseInt(sessionId)) {
                    setMessages(prev => {
                        const existingIds = new Set(prev.map(m => m.id));
                        const historyMessages = data.messages
                            .filter(m => !existingIds.has(m.id))
                            .map(m => ({
                                id: m.id,
                                sender: m.sender,
                                text: m.message,
                                timestamp: new Date(m.created_at),
                            }));
                        return [...historyMessages, ...prev];
                    });
                    return;
                }

                // Normal agent/bot/system messages
                const res = data?.response;
                if (!res || res.session_id !== parseInt(sessionId)) return;

                addMessage({
                    sender: res.sender,
                    text: res.message,
                    timestamp: new Date()
                });
            };

            socket.onerror = (error) => {
                console.warn("Agent WS error", error);
            };

            socket.onclose = () => {
                if (!isMountedRef.current) return;

                const attempt = reconnectAttemptsRef.current;
                if (attempt >= MAX_RECONNECT_ATTEMPTS) {
                    addMessage({
                        sender: 'bot',
                        text: 'Connection lost. Please refresh the page.',
                        timestamp: new Date()
                    });
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
            if (socketRef.current) {
                socketRef.current.onclose = null; // prevent reconnect on intentional close
                socketRef.current.close();
                socketRef.current = null;
            }
            // re-enable reconnect for next mount
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
                <div className="p-3 text-white d-flex justify-content-between align-items-center" style={{ backgroundColor: primaryColor }}>
                    <div className="d-flex align-items-center gap-2">
                        <div className="text-primary rounded-circle p-1 d-flex justify-content-center align-items-center" style={{ width: 36, height: 36, background: '#ffffff' }}>
                            <img src={ChatViqIcon} alt="Chatviq" className='h-100' loading="lazy" decoding="async" />
                        </div>
                        <div>
                            <h6 className="m-0 fw-bold">{title}</h6>
                            {/* {view === 'chat' && userInfo?.name && (
                                    <small className="opacity-75">Chatting as {userInfo?.name}</small>
                                )} */}
                        </div>
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                        {/* {view === 'chat' && ( */}
                        <button
                            className="btn btn-sm text-white"
                            onClick={handleClearChat}
                            title="Clear chat"
                        >
                            Clear
                        </button>
                        {/* )} */}
                        {/* <button
                            className="btn btn-sm text-white "
                            onClick={() => setIsOpen(false)}
                            aria-label="Close"
                        >
                            <X size={24} />
                        </button> */}
                    </div>
                </div>

                {/* Body */}
                <div className="flex-grow-1 overflow-auto p-3 chat-body position-relative">
                    {messages.length === 0 ? (
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


                {/* Footer - Input Area (Only in chat view) */}
                {/* {view === 'chat' && ( */}
                <div className="chat-footer">
                    {/* Attachment Preview */}
                    {attachment && (
                        <div className="mb-2 d-flex align-items-center justify-content-between chat-attachment-preview p-2 rounded">
                            <div className="d-flex align-items-center gap-2">
                                <ImageIcon size={16} />
                                <span className="small">Image ready to send</span>
                            </div>
                            <button
                                className="btn btn-sm btn-link text-danger p-0"
                                onClick={() => setAttachment(null)}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSend} className="d-flex gap-2 align-items-center">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept="image/*"
                            className="d-none"
                        />
                        <button
                            type="button"
                            className="btn chat-icon-btn p-2 rounded-circle"
                            onClick={() => fileInputRef.current?.click()}
                            title="Upload Image"
                        >
                            <ImageIcon size={20} />
                        </button>

                        <div className="flex-grow-1 position-relative">
                            <input
                                type="text"
                                className="chat-input rounded-pill"
                                placeholder="Type your message..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSend(e);
                                }}
                                style={{ padding: '10px 45px 10px 15px' }}
                            />
                            <button
                                type="button"
                                className="btn btn-link position-absolute end-0 top-50 translate-middle-y chat-icon-muted p-0 pe-2"
                                title="Attach file"
                            >
                                <Paperclip size={18} />
                            </button>
                        </div>

                        <div className="d-flex gap-1">
                            <button
                                type="button"
                                className={`btn p-2 rounded-circle ${isRecording ? 'btn-danger voice-recording' : 'chat-icon-btn'}`}
                                onClick={handleVoiceRecord}
                                title={isRecording ? "Stop recording" : "Voice message"}
                            >
                                <Mic size={20} />
                            </button>

                            <button
                                type="submit"
                                className="btn p-2 rounded-circle d-flex justify-content-center align-items-center chat-send-btn"
                                disabled={!inputText.trim() && !attachment}
                                style={{ backgroundColor: primaryColor, border: 'none', width: '36px', height: '36px' }}
                                title="Send message"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </form>
                </div>
                {/* )} */}
            </div>
            {/* )} */}
        </div>
    );
};

export default ChatWidget;