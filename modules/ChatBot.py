import os
import json
import time
from datetime import datetime
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv

class ChatBot:
    def __init__(self):
        # 載入環境變數
        load_dotenv()
        self.api_key = os.getenv('OPENAI_API_KEY')
        self.client = OpenAI(api_key=self.api_key)
        
        # 設定對話儲存路徑
        self.conversation_dir = Path('static/data/conversation')
        self.conversation_dir.mkdir(parents=True, exist_ok=True)
        
        # 初始化對話歷史
        self.conversation_history = []
    
    def _save_conversation(self, conversation_id):
        """儲存對話歷史到檔案"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{conversation_id}_{timestamp}.json"
        filepath = self.conversation_dir / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump({
                'conversation_id': conversation_id,
                'timestamp': timestamp,
                'messages': self.conversation_history
            }, f, ensure_ascii=False, indent=2)
    
    def _load_conversation(self, conversation_id):
        """載入特定對話歷史"""
        # 找出最新的對話檔案
        files = list(self.conversation_dir.glob(f"{conversation_id}_*.json"))
        if not files:
            return []
        
        latest_file = max(files, key=lambda x: x.stat().st_mtime)
        with open(latest_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get('messages', [])
    
    def chat(self, message, conversation_id=None, recipe=None):
        """與GPT-4模型進行對話"""
        if conversation_id:
            # 如果提供了conversation_id，載入歷史對話
            self.conversation_history = self._load_conversation(conversation_id)
        
        # 將用戶訊息加入對話歷史
        self.conversation_history.append({"role": "user", "content": message})
        print(self.conversation_history)

        if recipe != None:
            prompt4recipe = f"user生成了以下食譜:\n{recipe}。"
        else:
            prompt4recipe = "user尚未生成任何食譜。"
        self.conversation_history.insert(-1, {"role": "developer", "content": f"你是用戶專屬的AI營養師，請使用您來稱呼用戶，你使用的語言是繁體中文，{prompt4recipe}如果用戶向你說「你好」請自我介紹。任何回覆儘量在50字左右，精簡而禮貌，並使用純文字格式。"})
        print(self.conversation_history)

        try:
            # 呼叫GPT-4 API
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages = self.conversation_history,
                temperature=0.7,
                max_tokens=1000
            )
            
            del self.conversation_history[-2]
            # 取得回應內容
            assistant_message = response.choices[0].message.content
            
            # 將助手回應加入對話歷史
            self.conversation_history.append({
                "role": "assistant",
                "content": assistant_message
            })
            
            # 儲存對話歷史
            if not conversation_id:
                # 如果沒有提供conversation_id，生成新的
                conversation_id = f"chat_{int(time.time())}"
            self._save_conversation(conversation_id)
            
            return {
                "response": assistant_message,
                "conversation_id": conversation_id
            }
            
        except Exception as e:
            print(f"Error in chat: {str(e)}")
            return {
                "error": str(e),
                "conversation_id": conversation_id
            }
    
    def get_conversation_history(self, conversation_id):
        """獲取特定對話的歷史記錄"""
        return self._load_conversation(conversation_id)