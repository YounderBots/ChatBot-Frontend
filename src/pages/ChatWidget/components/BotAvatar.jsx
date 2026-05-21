import { Bot } from "lucide-react";

const BotAvatar = () => (
    <div className="d-flex justify-content-center align-items-center" 
         style={{ 
             width: 36, 
             height: 36, 
             background: '#FFF5EE', 
             border: '1px solid #FFE7D6', 
             borderRadius: '10px',
             color: '#e25608',
             padding: '4px'
         }}>
        <Bot size={22} strokeWidth={2} />
    </div>
);

export default BotAvatar;