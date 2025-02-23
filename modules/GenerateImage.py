import os
import markdown
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")

def format_prompt_with_recipe(recipe):
    prompt = f"你是一個專業的圖片提示詞生成助手，請根據以下食譜生成適合 Dall-E 的圖片提示詞：\n\n{recipe}\n\n請不要生成其他內容。"
    return prompt

def generate_prompt_for_dall_e(prompt):
    client = OpenAI(api_key=openai_api_key)
    try:
        response = client.chat.completions.create(
            model="gpt-4o",  # 或 "gpt-4o"
            messages=[{"role": "system", "content": "你是一個專業的圖片提示詞生成助手。"}, {"role": "user", "content": prompt}],
            temperature=0.7)
        return markdown.markdown(response.choices[0].message.content)
    except Exception as e:
        print(f"調用 OpenAI API 時發生錯誤：{e}")
        return None

def prompt_to_image(prompt):
    client = OpenAI(api_key=openai_api_key)
    try:
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        return response.data[0].url
    except Exception as e:
        print(f"調用 OpenAI API 時發生錯誤：{e}")
        return None