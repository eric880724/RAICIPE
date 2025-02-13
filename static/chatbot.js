document.addEventListener('DOMContentLoaded', function() {
    const chatContainer = document.querySelector('.chat-container');
    const chatIcon = document.querySelector('.chat-icon');
    const closeBtn = document.querySelector('.close-btn');
    const sendBtn = document.querySelector('.send-btn');
    const chatInput = document.querySelector('.chatbot-input input');
    const chatMessages = document.querySelector('.chatbot-messages');

    // 切換聊天視窗
    chatIcon.addEventListener('click', function() {
        chatContainer.classList.toggle('active');
    });

    // 關閉聊天視窗
    closeBtn.addEventListener('click', function() {
        chatContainer.classList.remove('active');
    });

    // 發送訊息功能
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            // 創建用戶訊息元素
            const userMessage = document.createElement('div');
            userMessage.style.textAlign = 'right';
            userMessage.style.margin = '10px 0';
            userMessage.innerHTML = `${message}`;
            chatMessages.appendChild(userMessage);

            // 清空輸入框
            chatInput.value = '';
            
            // 滾動到最新訊息
            chatMessages.scrollTop = chatMessages.scrollHeight;
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