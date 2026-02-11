import { UserCircle2 } from "lucide-react";
import { useState } from "react";
import BotAvatar from "./BotAvatar";
import './Conversation.css';

const MessageBubble = ({ message, onAction }) => {
    const [previewImage, setPreviewImage] = useState(null);
    const [toggleTime, setToggleTime] = useState(false);

    const isUser = message.sender === 'agent';
    const isBot = message.sender === 'bot';

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };




    const VoicePlayer = ({ src }) => {
        const audioRef = useRef(null);
        const [isPlaying, setIsPlaying] = useState(false);
        const [progress, setProgress] = useState(0);
        const [duration, setDuration] = useState(0);

        useEffect(() => {
            const audio = new Audio(src);
            audioRef.current = audio;

            const onLoaded = () => setDuration(audio.duration || 0);
            const onTimeUpdate = () =>
                setProgress((audio.currentTime / audio.duration) * 100 || 0);
            const onEnded = () => setIsPlaying(false);

            audio.addEventListener('loadedmetadata', onLoaded);
            audio.addEventListener('timeupdate', onTimeUpdate);
            audio.addEventListener('ended', onEnded);

            return () => {
                audio.pause();
                audio.removeEventListener('loadedmetadata', onLoaded);
                audio.removeEventListener('timeupdate', onTimeUpdate);
                audio.removeEventListener('ended', onEnded);
            };
        }, [src]);

        const togglePlay = () => {
            if (!audioRef.current) return;

            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        };

        const formatTime = (sec) => {
            if (!sec) return '0:00';
            const m = Math.floor(sec / 60);
            const s = Math.floor(sec % 60).toString().padStart(2, '0');
            return `${m}:${s}`;
        };

        return (
            <div className="voice-bubble d-flex align-items-center gap-2">
                <button
                    className="voice-play-btn"
                    onClick={togglePlay}
                    aria-label="Play voice message"
                >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>

                <div className="voice-wave-wrapper flex-grow-1">
                    <div className="voice-wave">
                        <div
                            className="voice-wave-progress"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <span className="voice-duration">
                    {formatTime(duration)}
                </span>
            </div>
        );
    };
    const formatChatText = (text) => {
        if (!text) return "";

        return text
            // Escape HTML for safety
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")

            // Bold **text**
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

            // Headings (**Title:**)
            .replace(
                /^<strong>(.+?):<\/strong>$/gm,
                "<div class='chat-heading'>$1:</div>"
            )

            // Normalize bullets: ? or • → bullet row
            .replace(
                /^[?•]\s*(.+)$/gm,
                "<div class='chat-bullet'>• $1</div>"
            )

            // Paragraph spacing (double newline)
            .replace(/\n{2,}/g, "<div class='chat-gap'></div>")

            // Single newline
            .replace(/\n/g, "<br />");
    };



    return (
        <div
            className={`d-flex mb-3 ${isUser ? 'justify-content-end' : 'justify-content-start align-items-start'
                }`}
        >
            {/* BOT AVATAR */}
            {!isUser && (
                isBot ? <BotAvatar /> : <UserCircle2 size={20} strokeWidth={1.5} style={{ marginTop: "4px" }} />
            )}
            {/* MESSAGE COLUMN */}
            <div className={`d-flex flex-column ${isUser ? 'align-items-end w-80' : 'align-items-start'}`}>

                {/* IMAGE MODAL */}
                {previewImage && (
                    <>
                        <div
                            className="modal-backdrop fade show"
                            onClick={() => setPreviewImage(null)}
                        />
                        <div className="modal show d-block" tabIndex="-1">
                            <div className="modal-dialog modal-dialog-centered modal-lg">
                                <div className="modal-content">
                                    <div className="modal-body p-0">
                                        <img src={previewImage} loading="lazy" className="img-fluid w-100" decoding="async" />
                                    </div>
                                    <button
                                        className="btn-close position-absolute top-0 end-0 m-3"
                                        onClick={() => setPreviewImage(null)}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* MESSAGE BUBBLE */}
                <div onClick={() => setToggleTime(!toggleTime)} className={`message-bubble
                ${(message.type === 'voice' && message.audio) ? "voiceMessage" : ""}
                ${isUser ? 'message-user' : 'message-bot'}`}>

                    {/* {message.text && <div className="text-break  text-justify">{message.text}</div>} */}
                    {message.text && (
                        <div
                            className="text-break text-justify"
                            dangerouslySetInnerHTML={{
                                __html: formatChatText(message.text),
                            }}
                        />
                    )}


                    {message.type === 'image' && message.image && (
                        <div className="attachment-preview mt-2">
                            <img
                                src={message.image.src}
                                alt={message.image.name}
                                className="img-fluid rounded cursor-pointer"
                                onClick={() => setPreviewImage(message.image.src)}
                                loading="lazy"
                                decoding="async"
                            />
                            <small className="text-muted d-block mt-1">
                                {message.image.name}
                            </small>
                        </div>
                    )}

                    {message.type === 'voice' && message.audio && (
                        <div className="voice-message mt-2">
                            <VoicePlayer src={message.audio.src} />
                        </div>
                    )}


                </div>

                {/* BOT ACTION BUTTONS */}
                {!isUser && message.quickReplies?.length > 0 && (
                    <div className="d-flex flex-wrap gap-2 mt-2">
                        {message.quickReplies.map((qr) => (
                            <button
                                key={qr.id}
                                className="btn btn-outline-primary btn-sm rounded-pill bot-btn"
                                onClick={() =>
                                    onAction({
                                        label: qr.button_text,
                                        value: qr.message_value,
                                        action_type: qr.action_type,
                                    })
                                }
                            >
                                {qr.button_text}
                            </button>
                        ))}
                    </div>
                )}

                {toggleTime && <div
                    className={`text-end  mt-1 ${isUser ? (message.type === 'voice' && message.audio ? '' : 'text-muted ') : 'text-muted'
                        }`}
                    style={{ fontSize: '0.7rem' }}
                >
                    {formatTime(message.timestamp)}
                </div>}
            </div>
        </div>
    );

};


export default MessageBubble