import os
import markdown
from openai import OpenAI
from dotenv import load_dotenv
from bs4 import BeautifulSoup

load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")

# 格式化食材為 OpenAI API 的輸入格式
def format_ingredients_for_prompt(ingredients):
    prompt = "你是一個食譜生成小助手，請幫我以這些食材生成一份食譜：\n\n"
    
    for idx, ingredient in enumerate(ingredients, 1):  
        prompt += f"{idx}. {ingredient}\n"  # 直接使用 ingredient，因為它是字串
    prompt += "\n請不要生成食譜以外的任何資訊。\n\n格式需求：\n以下h2,h4,列表內需要替換為實際生成內容，h3內則維持原本的文字，()內為備註內容。\n<h2>食譜標題與名稱</h2>\n<h3>食材列表</h3>\n<ul><li>食材1</li><li>食材2</li><li>食材3</li></ul>\n<h3>食材詳情</h3><h4>食材1</h4>\n<ul>\n<li>食材1詳情</li>\n<li>食材1詳情</li>\n</ul>\n<h3>食材詳情</h3><h4>食材2</h4>\n<ul>\n<li>食材2詳情</li>\n<li>食材2詳情</li></ul><h3>食材詳情</h3><h4>食材3</h4>\n<ul>\n<li>食材3詳情</li>\n<li>食材3詳情</li></ul>    (若還有其他食材，可以增加食材詳情)\n<h3>調味料</h3>\n<ul>\n    <li>調味料1:詳情</li>\n    <li>調味料2:詳情</li>\n    (若還有其他調味料，可以增加項目)\n</ul>\n<h3>料理步驟</h3>\n<ul>\n    <li>步驟1</li>\n    <li>步驟2</li>\n    (若還有其他步驟，可以增加項目)\n</ul>\n<h3>小提示</h3>\n<ul>\n    <li>小提示1</li>\n    <li>小提示2</li>\n    (若還有其他小提示，可以增加項目)\n</ul>"
    
    return prompt

def format_ingredients_for_prompt_line(ingredients):
    prompt = "你是一個食譜生成小助手，請幫我以這些食材生成一份食譜：\n\n"
    
    for idx, ingredient in enumerate(ingredients, 1):  
        prompt += f"{idx}. {ingredient}\n"  # 直接使用 ingredient，因為它是字串
    prompt += "\n請不要生成食譜以外的任何資訊。\n\n格式需求：\n以下h2,h4,列表內需要替換為實際生成內容，h3內則維持原本的文字，()內為備註內容。\n<h2>食譜標題與名稱</h2>\n<h3>食材</h3>\n<h4>食材1</h4>\n<ul>\n    <li>食材1詳情</li>\n    <li>食材1詳情</li>\n    (若還有其他詳情，可以增加項目)\n</ul>\n    (若還有其他食材，比照食材1及其列表)\n<h3>調味料</h3>\n<ul>\n    <li>調味料1:詳情</li>\n    <li>調味料2:詳情</li>\n    (若還有其他調味料，可以增加項目)\n</ul>\n<h3>料理步驟</h3>\n<ol>\n    <li>步驟1</li>\n    <li>步驟2</li>\n    (若還有其他步驟，可以增加項目)\n</ol>\n<h3>小提示</h3>\n<ul>\n    <li>小提示1</li>\n    <li>小提示2</li>\n    (若還有其他小提示，可以增加項目)\n</ul>"
    
    return prompt

# 調用 OpenAI API
def generate_recipe(prompt):
    client = OpenAI(api_key=openai_api_key)
    try:
        response = client.chat.completions.create(
            model="gpt-4o",  # 或 "gpt-4o"
            messages=[{"role": "system", "content": "你是一個專業的食譜助手。"}, {"role": "user", "content": prompt}],
            temperature=0.7)
        return response.choices[0].message.content
    except Exception as e:
        print(f"調用 OpenAI API 時發生錯誤：{e}")
        return None

def recipe_slice(html_content):
    html_content = html_content.replace('\n',"")
    html_content = html_content.replace(' ',"")
    soup = BeautifulSoup(html_content, 'html.parser')

    # 獲取食譜標題 (h2)
    recipe_title = soup.find('h2').get_text() if soup.find('h2') else "食譜"

    # 初始化結果列表
    sections = [recipe_title]

    # 找到所有h3標題
    h3_tags = soup.find_all('h3')

    for i, h3 in enumerate(h3_tags):
        section_content = ""
        current = h3
        
        # 將h3標題加入內容
        section_content = section_content+str(current)
        
        # 獲取直到下一個h3標題之前的所有內容
        while current.next_sibling:
            current = current.next_sibling
            if current.name == 'h3':
                break
            if str(current).strip():
                section_content = section_content+str(current)
        
        # 將這一段加入結果列表
        sections.append(section_content)
    return sections

# def header_formatting(recipe_content):
#     # 分行處理以確保準確性
#     lines = recipe_content.split('\n')
#     modified_lines = []   
    
#     for line in lines:
#         # 處理 h2 標籤
#         if '<h2' in line and 'class=' not in line:
#             line = line.replace('<h2', r'<h2 class="step-title"')
        
#         # 處理 h3 標籤
#         if '<h3' in line and 'class=' not in line:
#             line = line.replace('<h3', r'<h3 class="recipe-name"')
            
#         # 處理 ul 標籤
#         if '<ul' or '<ol' in line and 'class=' not in line:
#             line = line.replace('<ul', r'<ul class="recipe-step"')
#             line = line.replace('<ol', r'<ol class="recipe-step"')

#         if '</li>' in line and 'class=' not in line:
#             line = line.replace('</li>', r'<br />')
#             line = line.replace('<li>', '')
        
#         modified_lines.append(line)
    
#     modified_lines.insert(0, '')
#     modified_lines.insert(0, '')
#     modified_lines.insert(0, '')

#     return '\n'.join(modified_lines)

def generate_recipe_line(prompt):
    client = OpenAI(api_key=openai_api_key)
    try:
        response = client.chat.completions.create(
            model="gpt-4o",  # 或 "gpt-4o"
            messages=[{"role": "system", "content": "你是一個專業的食譜助手，只回答食譜的內容，生成時禁止使用任何格式，只剩成純文字，並妥善以空格分段。"}, {"role": "user", "content": prompt}],
            temperature=0.7)
        soup = BeautifulSoup(response.choices[0].message.content, "html.parser")

        # 把所有文字內容提取出來，並用換行符號連接
        clean_text = "\n".join(soup.stripped_strings)
        return clean_text
    except Exception as e:
        print(f"調用 OpenAI API 時發生錯誤：{e}")
        return None

# 保存結果到 txt 檔案
def save_to_txt(content, output_path):
    if not os.path.exists(output_path):
        with open(output_path, 'w', encoding='utf-8') as f:
            pass  # 建立空白檔案

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content + "\n")

# 主程式
if __name__ == "__main__":
    input_txt = os.path.join('.', 'detected_fruits_vegetables.txt') 
    output_txt = "recipe_output.txt"

    # 1. 讀取食材
    ingredients = CSVHandler.read_csv(input_txt)
    if not ingredients:
        print("無法讀取食材列表，請確認檔案內容格式正確。")
    else:
        # 2. 格式化輸入內容
        prompt = format_ingredients_for_prompt(ingredients)
        print(f"生成的 Prompt：\n{prompt}")

        # 3. 調用 OpenAI API
        recipe = generate_recipe(prompt)
        if recipe:
            print(f"生成的食譜：\n{recipe}")

            # 4. 保存到 txt 檔案
            save_to_txt(recipe, output_txt)
            print(f"食譜已保存至 {output_txt}")
        else:
            print("無法生成食譜，請檢查 API 配置或輸入內容。")
