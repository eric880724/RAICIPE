document.addEventListener('DOMContentLoaded', function() {
    const chatContainer = document.querySelector('.chat-container');
    const chatIcon = document.querySelector('.chat-icon');
    const closeBtn = document.querySelector('.close-btn');
    const sendBtn = document.querySelector('.send-btn');
    const chatInput = document.querySelector('.chatbot-input input');
    const chatMessages = document.querySelector('.chatbot-messages');

    // 儲存當前對話ID
    let currentConversationId = null;

    // 切換聊天視窗
    chatIcon.addEventListener('click', function() {
        chatContainer.classList.toggle('active');
        if (chatContainer.classList.contains('active') && currentConversationId) {
            loadChatHistory();
        }
    });

    // 關閉聊天視窗
    closeBtn.addEventListener('click', function() {
        chatContainer.classList.remove('active');
    });

    // 載入對話歷史
    async function loadChatHistory() {
        if (!currentConversationId) return;

        try {
            const response = await fetch(`/chat/history?conversation_id=${currentConversationId}`);
            const data = await response.json();
            
            if (data.history) {
                chatMessages.innerHTML = ''; // 清空現有訊息
                data.history.forEach(msg => {
                    appendMessage(msg.content, msg.role === 'user');
                });
            }
        } catch (error) {
            console.error('載入對話歷史失敗:', error);
        }
    }

    // 添加訊息到聊天視窗
    function appendMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user-message' : 'bot-message'}`;
        
        if (isUser) {
            // 用戶訊息保持純文字
            messageDiv.textContent = message;
        } else {
            // 機器人訊息使用 marked 解析 markdown
            messageDiv.innerHTML = marked.parse(message);
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 發送訊息到後端
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // 顯示用戶訊息
        appendMessage(message, true);
        chatInput.value = '';

        try {
            // 顯示載入中動畫
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'loading-message';
            loadingDiv.textContent = '正在思考...';
            chatMessages.appendChild(loadingDiv);

            // 發送請求到後端
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    conversation_id: currentConversationId,
                    recipe_generated: recipeGeneratedconfirmed
                })
            });

            // 移除載入中動畫
            loadingDiv.remove();

            const data = await response.json();
            
            if (data.error) {
                appendMessage('抱歉，發生了一些錯誤。請稍後再試。', false);
                return;
            }

            // 更新對話ID
            currentConversationId = data.conversation_id;
            
            // 顯示助手回應
            appendMessage(data.response, false);

        } catch (error) {
            console.error('發送訊息失敗:', error);
            appendMessage('抱歉，發生了一些錯誤。請稍後再試。', false);
        }
    }

    // 點擊發送按鈕發送訊息
    sendBtn.addEventListener('click', sendMessage);

    // 按Enter鍵發送訊息
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});