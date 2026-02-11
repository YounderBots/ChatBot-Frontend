import React from 'react'

const ChatbotLaunchericon = () => {
    return (
        <div className='' style={{
            backgroundColor: '#2a6789',
            padding: '20px',
            borderRadius: '50%'
        }}>

            <img src='/assets/images/chatbotIcon.png' alt="Launcher Image" decoding="async" loading="lazy" style={
                {
                    height: '50px',
                    width: '50px',
                    objectFit: 'contain',
                }
            } />
        </div>
    )
}

export default ChatbotLaunchericon