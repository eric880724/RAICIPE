import csv
import os

class CSVHandler:
    """ 負責讀取 & 寫入 CSV 檔案的模組 """

    @staticmethod
    def read_csv(file_path):
        """ 讀取 CSV，回傳食材列表 (字典格式) """
        ingredients = []
        if os.path.exists(file_path):
            with open(file_path, newline='', encoding='utf-8') as f:
                reader = csv.reader(f)
                next(reader, None)  # 跳過標題行
                for row in reader:
                    ingredients.append(row[0])
        return ingredients

    @staticmethod
    def write_csv(file_path, data):
        """ 儲存確認過的食材到 CSV """
        with open(file_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            # 寫入標題行
            writer.writerow(['Ingredients'])
            # 每個食材寫入一行
            for ingredient in data[1:]:  # 跳過第一個元素 (標題 'Ingredients')
                writer.writerow([ingredient])
