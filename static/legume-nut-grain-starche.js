document.addEventListener('DOMContentLoaded', () => {
    const ingredientsGrid = document.getElementById('ingredients-grid');

    // 模態視窗元素
    const modal = document.getElementById('myModal');
    const modalImg = document.getElementById('img01');
    const captionText = document.getElementById('caption');
    const closeBtn = document.getElementsByClassName('close')[0];

    // 假設我們有一個包含食材名稱和圖片的數組
    const ingredients = [
        { name: 'Potato 馬鈴薯', image: '/static/images/potato.png' },
        { name: 'Sweet potato 地瓜', image: '/static/images/sweetpotato.png' },
        { name: 'Tofu 豆腐', image: '/static/images/tofu.png' },
        { name: 'Garbanzo 鷹嘴豆', image: '/static/images/garbanzo.png' },
        { name: 'Corn 玉米', image: '/static/images/corn.png' },
        { name: 'Almond 杏仁', image: '/static/images/almond.png' },
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