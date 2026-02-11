import BotAvatar from './BotAvatar'

const TypingIndicator = () => {
    return (
        <div className="typing-indicator">
            <BotAvatar />
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
        </div>

    )
}

export default TypingIndicator