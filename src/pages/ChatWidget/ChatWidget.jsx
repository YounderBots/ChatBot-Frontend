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

import ChatViqIcon from '../../assets/favIconChatViq.png';
import MessageBubble from './components/MessageBubble';
import TypingIndicator from './components/TypingIndicator';


const ChatWidget = ({
    agentId,
    sessionId,   // THIS IS KEY
    mode = "agent",
    title = "Agent Chat",
    primaryColor = "#2a6789",
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

        // Call external callback if provided
        if (onUserAction) {
            onUserAction(actionObj);
        }

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
            type: "MESSAGE",
            text: actionObj.value
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
            alert('Microphone access denied');
        }
    };


    const handleClearChat = () => {
        if (window.confirm('Clear all messages?')) {
            setMessages([]);
            setActiveSessionId('');
        }
    };

    useEffect(() => {
        if (!agentId || !sessionId) return;

        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }

        const socket = new WebSocket(
            `ws://127.0.0.1:8000/chat/ws/agent/${agentId}`
        );

        socketRef.current = socket;


        socket.onopen = () => {
            // console.log("Agent WS connected");
        };


        socket.onmessage = (event) => {
            // console.log(event);

            const data = JSON.parse(event.data);
            // console.log(data);



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

                    console.log("historyMessages", historyMessages);



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
            console.warn("Agent WS transient error", error);
        };


        socket.onclose = () => {
            console.log("Agent WS closed");
        };

        return () => {
            socket.close()
            socketRef.current = null;
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
                        <div className="bg-white text-primary rounded-circle p-1 d-flex justify-content-center align-items-center" style={{ width: 36, height: 36 }}>
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
                                <MessageBubble key={msg.id} message={msg} onAction={handleBotAction} />
                            ))}
                            {isTyping && <TypingIndicator />}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>


                {/* Footer - Input Area (Only in chat view) */}
                {/* {view === 'chat' && ( */}
                <div className="p-3 bg-white border-top">
                    {/* Attachment Preview */}
                    {attachment && (
                        <div className="mb-2 d-flex align-items-center justify-content-between bg-light p-2 rounded">
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
                            className="btn btn-light text-muted p-2 rounded-circle"
                            onClick={() => fileInputRef.current?.click()}
                            title="Upload Image"
                        >
                            <ImageIcon size={20} />
                        </button>

                        <div className="flex-grow-1 position-relative">
                            <input
                                type="text"
                                className="form-control border-0 bg-light rounded-pill"
                                placeholder="Type your message..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSend(e);
                                    }
                                }}
                                style={{ padding: '10px 45px 10px 15px' }
                                }
                            />
                            <button
                                type="button"
                                className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted p-0 pe-2"
                                title="Attach file"
                            >
                                <Paperclip size={18} />
                            </button>
                        </div>

                        <div className="d-flex gap-1">
                            <button
                                type="button"
                                className={`btn p-2 rounded-circle ${isRecording ? 'btn-danger voice-recording' : 'btn-light text-muted'}`}
                                onClick={handleVoiceRecord}
                                title={isRecording ? "Stop recording" : "Voice message"}
                            >
                                <Mic size={20} />
                            </button>

                            <button
                                type="submit"
                                className="btn btn-primary p-2 rounded-circle d-flex justify-content-center"
                                disabled={!inputText.trim() && !attachment}
                                style={{ backgroundColor: primaryColor, border: 'none', width: '36px', height: '36px' }}
                                title="Send message"
                            >
                                <Send size={20} />
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