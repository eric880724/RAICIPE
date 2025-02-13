from flask import Flask, render_template

app = Flask(__name__)

# 主頁路由
@app.route("/")
def home():  # 將函數名稱改為 home()，避免與其他路由衝突
    return render_template("main.html")

# 主頁 (main.html)
@app.route("/templates/main.html")
def main():
    return render_template("main.html")

# 掃描食材頁面 (scan.html)
@app.route("/templates/scan.html")
def scan():
    return render_template("scan.html")

# 食譜頁面 (recipe.html)
@app.route("/templates/recipe.html")
def recipe():
    return render_template("recipe.html")

# 水果頁面 (fruit.html)
@app.route("/templates/fruit.html")
def fruit():
    return render_template("fruit.html")

# 蔬菜頁面 (vegetable.html)
@app.route("/templates/vegetable.html")
def vegetable():
    return render_template("vegetable.html")

# 調味料頁面 (seasoning.html)
@app.route("/templates/seasoning.html")
def seasoning():
    return render_template("seasoning.html")

# 豆類、堅果穀物頁面 (legume-nut-grain-starche.html)
@app.route("/templates/legume-nut-grain-starche.html")
def legume_nut_grain_starch():
    return render_template("legume-nut-grain-starche.html")

if __name__ == "__main__":
    app.run(debug=True)