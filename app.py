from flask import Flask, render_template, Response, request, jsonify, abort
from ultralytics import YOLO
import cv2
import os
import glob
from datetime import datetime
import base64
from io import BytesIO
from PIL import Image
import csv
import numpy as np
from linebot import  LineBotApi, WebhookHandler
from linebot.exceptions import InvalidSignatureError
from linebot.models import (
    MessageEvent, TextMessage, ImageMessage,
    TextSendMessage, ImageSendMessage, StickerSendMessage,
    LocationSendMessage, QuickReply, QuickReplyButton, MessageAction
)
from dotenv import load_dotenv
from modules.CSVHandler import CSVHandler
from modules.GenerateRecipe import format_ingredients_for_prompt, format_ingredients_for_prompt_line, generate_recipe, save_to_txt, generate_recipe_line, recipe_slice
from modules.GenerateImage import format_prompt_with_recipe, prompt_to_image, generate_prompt_for_dall_e
from modules.ChatBot import ChatBot

load_dotenv()
chatbot = ChatBot()

app = Flask(__name__)

openai_api_key = os.getenv("OPENAI_API_KEY")
line_bot_api = LineBotApi(os.getenv("LINE_BOT_API_KEY"))
handler = WebhookHandler(os.getenv("LINE_BOT_HANDLER_KEY"))

UPLOAD_FOLDER = os.path.join(app.root_path, 'static/data/picture/uploads')
PROCESSED_FOLDER = os.path.join(app.root_path, 'static/data/picture/processed')
TEXT_FOLDER = os.path.join(app.root_path, 'static/data/result_csv')
RECIPE_FOLDER = os.path.join(app.root_path, 'static/data/recipe')
CHAT_FOLDER = os.path.join(app.root_path, 'static/data/conversation')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)
os.makedirs(TEXT_FOLDER, exist_ok=True)

model_paths = {
    'best_fruit': YOLO('./model/best_fruit_v23.pt'),
    'best_v2': YOLO('./model/v2_old.pt')
}

# 主頁路由
@app.route("/")
def home():  # 將函數名稱改為 home()，避免與其他路由衝突
    return render_template("main.html")

# 主頁 (main.html)
@app.route("/main")
def main():
    return render_template("main.html")

# 掃描食材頁面 (scan.html)
@app.route('/scan')
def scan():
    return render_template("scan.html")

@app.route('/capture', methods=['POST', 'GET'])
def capture():
    model_name = request.args.get('model','best_fruit')
    model = model_paths.get(model_name, model_paths['best_fruit'])

    if not model:
        return jsonify({'error': 'Invalid model name', 'message': '請選擇有效的模型'}), 400

    # 確保請求的 Content-Type 正確
    if not request.is_json:
        return jsonify({'error': 'Invalid Content-Type', 'message': "請確保 'Content-Type' 為 'application/json'"}), 415

    try:
        # 嘗試解析傳來的 JSON
        data = request.get_json()

        if 'image' not in data:
            return jsonify({'error': 'Missing image data', 'message': '請確保請求包含 base64 圖片'}), 400

        # 確認圖像數據是否存在
        image_data = data['image']
        if not image_data:
            return jsonify({'error': 'Invalid image data', 'message': '圖像數據無效或為空'}), 400

        # 將 base64 圖像數據解碼
        image_data = image_data.strip()  # 去除多餘的空格
        image_data = image_data.split(",")[1]  # 去掉 base64 開頭部分

        # 解碼 base64 圖像
        image = Image.open(BytesIO(base64.b64decode(image_data)))
        frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

    except Exception as e:
        return jsonify({'error': 'Invalid JSON format', 'message': str(e)}), 400

    # 生成檔名
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    original_path = os.path.join(UPLOAD_FOLDER, f'capture_{timestamp}.jpg')
    processed_path = os.path.join(PROCESSED_FOLDER, f'processed_{timestamp}.jpg')
    csv_path = os.path.join(TEXT_FOLDER, f'results_{timestamp}.csv')
    try:
        cv2.imwrite(original_path, frame)
        results = model(frame)
        detected_classes = []   
        with open(csv_path, 'w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['Ingredients'])
            for result in results:
                for box in result.boxes:
                    confidence = float(box.conf[0])  # 確保 confidence 是 float
                    if confidence < 0.3:  # 只加入 confidence ≥ 0.5 的項目
                        continue
                    coords = [int(v) for v in box.xyxy[0]]
                    cls = int(box.cls[0])
                    confidence = box.conf[0]
                    cv2.rectangle(frame, (coords[0], coords[1]), (coords[2], coords[3]), (0, 255, 0), 2)
                    cv2.putText(frame, model.names[cls], (coords[0], coords[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
                    detected_classes.append(model.names[cls])
            detected_classes = list(set(detected_classes))
            for x in detected_classes:
                writer.writerow([x])

        cv2.imwrite(processed_path, frame)
        # print("模型名稱:", model_name)
        # print("模型對應名稱:", model.names)
        # print("圖片是否成功讀取:", os.path.exists("debug_frame.jpg"))
        # print("模型回傳結果:", results)
        print(detected_classes)
        return jsonify({
            'status': 'success',
            'original_image': original_path,
            'processed_image': processed_path,
            "image": processed_path,
            "message": "分析成功",
            'detected_items': [{"name": item} for item in detected_classes]
        })
    except Exception as e:
        return jsonify({'error': 'Processing error', 'message': str(e)}), 500
        
# 處理新增食材
@app.route('/updateIngredients', methods=['POST'])
def update_ingredients():
    ingredients = request.json['ingredients']
    csv_files = glob.glob(os.path.join(TEXT_FOLDER, 'results_*.csv'))
    if csv_files:
        latest_csv = max(csv_files, key=os.path.getmtime)
    ingredients.insert(0, 'Ingredients')
    # 將食材名稱新增到儲存列表中（這裡可以改為儲存到資料庫）
    CSVHandler.write_csv(latest_csv, ingredients)
    print(f'已確認食材: {ingredients}')

    return jsonify({'message': f'食材 {ingredients} 確認完成'}), 200

@app.route('/generateRecipe', methods=['GET'])
def GPT_recipe():
    csv_files = glob.glob(os.path.join(TEXT_FOLDER, 'results_*.csv'))
    
    if not csv_files:
        print("找不到符合條件的 CSV 檔案。")
        return jsonify({"error": "找不到符合條件的 CSV 檔案"}), 400

    latest_csv = max(csv_files, key=os.path.getmtime)
    output_txt = latest_csv.replace('.csv', '.txt')

    # 1. 讀取食材
    try:
        ingredients = CSVHandler.read_csv(latest_csv)
    except Exception as e:
        print(f"讀取 CSV 時發生錯誤: {e}")
        return jsonify({"error": "讀取 CSV 失敗"}), 500

    if not ingredients:
        print("無法讀取食材列表，請確認檔案內容格式正確。")
        return jsonify({"error": "無法讀取食材列表"}), 400

    # 2. 格式化輸入內容
    prompt = format_ingredients_for_prompt(ingredients)
    print(f"生成的 Prompt：\n{prompt}")

    # 3. 調用 OpenAI API
    recipe = generate_recipe(prompt)
    if not recipe:
        print("無法生成食譜，請檢查 API 配置或輸入內容。")
        return jsonify({"error": "食譜生成失敗"}), 500
    print(f"生成的食譜：\n{recipe}")
    # 4. 保存到 txt 檔案
    save_to_txt(recipe, output_txt)
    print(f"食譜已保存至 {output_txt}")
    with open(output_txt, 'r', encoding='utf-8') as f:
        content = f.read()
    new_prompt = format_prompt_with_recipe(content)
    prompt_for_image = generate_prompt_for_dall_e(new_prompt)
    print(f"生成的圖片提示詞：\n{prompt_for_image}")
    image_url = prompt_to_image(prompt_for_image)
    if not image_url:
        print("無法生成圖片，請檢查 API 配置或輸入內容。")
        return jsonify({"error": "圖片生成失敗"}), 500
    print(f"生成的圖片網址：\n{image_url}")
    content = recipe_slice(content)
    return jsonify({"message": "食譜生成成功","recipe": content, "image_url": image_url})  # 以 JSON 格式回傳

# 食譜頁面 (recipe.html)
@app.route("/recipe")
def recipe():
    return render_template("recipe.html")

# 水果頁面 (fruit.html)
@app.route("/fruit")
def fruit():
    return render_template("fruit.html")

# 蔬菜頁面 (vegetable.html)
@app.route("/vegetable")
def vegetable():
    return render_template("vegetable.html")

# 調味料頁面 (seasoning.html)
@app.route("/seasoning")
def seasoning():
    return render_template("seasoning.html")

# 豆類、堅果穀物頁面 (legume-nut-grain-starche.html)
@app.route("/legume-nut-grain-starche")
def legume_nut_grain_starch():
    return render_template("legume-nut-grain-starche.html")

# 聊天機器人路由
@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        message = data.get('message')
        conversation_id = data.get('conversation_id')
        recipe_generated = data.get('recipe_generated')
        txt_files = glob.glob(os.path.join(TEXT_FOLDER, 'results_*.txt'))
        if txt_files:
            latest_recipe = max(txt_files, key=os.path.getmtime)
        if recipe_generated == 1:
            with open(latest_recipe, 'r', encoding='utf-8') as file:
                f = file.read()
        else:
            f = None
        if not message:
            return jsonify({'error': '請提供訊息內容'}), 400
            
        response = chatbot.chat(message, conversation_id, f)
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/chat/history', methods=['GET'])
def get_chat_history():
    try:
        conversation_id = request.args.get('conversation_id')
        if not conversation_id:
            return jsonify({'error': '請提供對話ID'}), 400
            
        history = chatbot.get_conversation_history(conversation_id)
        return jsonify({'history': history})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route("/callback", methods=['POST'])
def callback():
    # 獲取 X-Line-Signature header 值
    signature = request.headers.get('X-Line-Signature', '')
    
    # 獲取請求內容
    body = request.get_data(as_text=True)
    app.logger.info("Request body: " + body)
    
    try:
        # 驗證簽名並處理請求
        handler.handle(body, signature)
    except InvalidSignatureError:
        app.logger.error("Invalid signature. Please check your channel access token/channel secret.")
        abort(400)
    except Exception as e:
        app.logger.error(f"Error handling webhook: {str(e)}")
        abort(500)
        
    return 'OK'

@handler.add(MessageEvent)
def handle_message(event):
    app.logger.info(f"收到訊息，類型: {event.message.type}")
    
    try:
        if isinstance(event.message, ImageMessage):
            app.logger.info("處理圖片訊息")
            try:
                # 使用 v27 模型進行食材辨識
                model = model_paths.get("best_v2", model_paths['best_fruit'])
                app.logger.info("開始下載圖片")
                message_content = line_bot_api.get_message_content(event.message.id)
                image_data = message_content.content
                frame = cv2.imdecode(np.frombuffer(image_data, np.uint8), cv2.IMREAD_COLOR)
                
                if frame is None:
                    app.logger.error("圖片解碼失敗")
                    line_bot_api.reply_message(
                        event.reply_token,
                        TextSendMessage(text='圖片格式不正確，請重新上傳。')
                    )
                    return

                app.logger.info("開始食材辨識")
                results = model(frame)
                detected_classes = []
                
                for result in results:
                    for box in result.boxes:
                        confidence = float(box.conf[0])
                        if confidence < 0.5:
                            continue
                        cls = int(box.cls[0])
                        detected_classes.append(model.names[cls])
                
                detected_classes = list(set(detected_classes))
                app.logger.info(f"檢測到的食材: {detected_classes}")
                
                if not detected_classes:
                    app.logger.info("沒有檢測到食材")
                    line_bot_api.reply_message(
                        event.reply_token,
                        TextSendMessage(text='沒有檢測到任何食材，請重新拍攝或上傳清晰的食材圖片。')
                    )
                    return

                app.logger.info("開始生成食譜")
                prompt = format_ingredients_for_prompt_line(detected_classes)
                recipe = generate_recipe_line(prompt)
                
                if not recipe:
                    app.logger.error("食譜生成失敗")
                    line_bot_api.reply_message(
                        event.reply_token,
                        TextSendMessage(text='無法生成食譜，請稍後再試。')
                    )
                    return

                app.logger.info("開始生成料理圖片")
                new_prompt = format_prompt_with_recipe(recipe)
                prompt_for_image = generate_prompt_for_dall_e(new_prompt)
                image_url = prompt_to_image(prompt_for_image)
                
                if not image_url:
                    app.logger.warning("圖片生成失敗，只發送食譜文字")
                    line_bot_api.reply_message(
                        event.reply_token,
                        TextSendMessage(text=f"檢測到的食材：{', '.join(detected_classes)}\n\n{recipe}")
                    )
                    return

                app.logger.info("發送食譜和圖片")
                message = [
                    TextSendMessage(
                        text=f"檢測到的食材：{', '.join(detected_classes)}\n\n{recipe}"
                    ),
                    ImageSendMessage(
                        original_content_url=image_url,
                        preview_image_url=image_url
                    )
                ]
                line_bot_api.reply_message(event.reply_token, message)
                
            except Exception as e:
                app.logger.error(f"處理圖片時發生錯誤: {str(e)}")
                line_bot_api.reply_message(
                    event.reply_token,
                    TextSendMessage(text='處理圖片時發生錯誤，請稍後再試。')
                )
        
        elif isinstance(event.message, TextMessage):
            app.logger.info("處理文字訊息")
            line_bot_api.reply_message(
                event.reply_token,
                TextSendMessage(text='請上傳食材的照片，我會幫您生成食譜！')
            )
        
        else:
            app.logger.warning(f"未支援的訊息類型: {event.message.type}")
            line_bot_api.reply_message(
                event.reply_token,
                TextSendMessage(text='目前只支援圖片訊息，請上傳食材的照片。')
            )
            
    except Exception as e:
        app.logger.error(f"處理訊息時發生錯誤: {str(e)}")
        line_bot_api.reply_message(
            event.reply_token,
            TextSendMessage(text='系統發生錯誤，請稍後再試。')
        )

if __name__ == "__main__":
    app.run(debug=True)