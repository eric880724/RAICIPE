document.addEventListener('DOMContentLoaded', () => {
    const ingredientsGrid = document.getElementById('ingredients-grid');

    // 模態視窗元素
    const modal = document.getElementById('myModal');
    const modalImg = document.getElementById('img01');
    const captionText = document.getElementById('caption');
    const closeBtn = document.getElementsByClassName('close')[0];

    // 假設我們有一個包含食材名稱和圖片的數組
    const ingredients = [
        { name: 'Artichoke 朝鮮薊', image: '/static/images/121.png' },
        { name: 'Asparagus 蘆筍', image: '/static/images/123.png' },
        { name: 'Broccoli 花椰菜', image: '/static/images/517.png' },
        { name: 'Cauliflower 白花椰菜', image: '/static/images/518.png' },
        { name: 'Brussels sprouts 球芽甘藍', image: '/static/images/519.png' },
        { name: 'Capsicum 甜椒', image: '/static/images/520.png' },
        { name: 'Carrot 胡蘿蔔', image: '/static/images/521.png' },
        { name: 'Daikon 白蘿蔔', image: '/static/images/522.png' },
        { name: 'Pea food 豌豆', image: '/static/images/523.png' },
        { name: 'Courgette 櫛瓜', image: '/static/images/524.png' },
        { name: 'Cucumber 小黃瓜', image: '/static/images/525.png' },
        { name: 'Eggplant 茄子', image: '/static/images/531.png' },
        { name: 'Gourd 葫蘆', image: '/static/images/534.png' },
        { name: 'Green bean 四季豆', image: '/static/images/530.png' },
        { name: 'Scallion 青蔥', image: '/static/images/529.png' },
        { name: 'Tomato 番茄', image: '/static/images/532.png' },
        { name: 'Lettuce 萵苣', image: '/static/images/528.png' },
        { name: 'Mushroom 蘑菇', image: '/static/images/527.png' },
        { name: 'Pumpkin 南瓜', image: '/static/images/533.png' },
        { name: 'Turnip 蕪菁', image: '/static/images/526.png' },
    ];

    // 動態生成食材卡片
    ingredients.forEach(ingredient => {
        const card = document.createElement('div');
        card.classList.add('ingredient-card');

        const imageDiv = document.createElement('div');
        imageDiv.classList.add('ingredient-image');
        imageDiv.style.backgroundImage = `url(${ingredient.image})`;

        const nameDiv = document.createElement('div');
        nameDiv.classList.add('ingredient-name');
        nameDiv.textContent = ingredient.name;

        // 點擊圖片顯示模態視窗
        imageDiv.addEventListener('click', () => {
            modal.style.display = 'block';
            modalImg.src = ingredient.image;
            captionText.textContent = ingredient.name;
        });

        card.appendChild(imageDiv);
        card.appendChild(nameDiv);
        ingredientsGrid.appendChild(card);
    });

    // 點擊關閉按鈕關閉模態視窗
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // 點擊模態視窗外部關閉模態視窗
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});