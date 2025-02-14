document.addEventListener('DOMContentLoaded', () => {
    const ingredientsGrid = document.getElementById('ingredients-grid');

    // 模態視窗元素
    const modal = document.getElementById('myModal');
    const modalImg = document.getElementById('img01');
    const captionText = document.getElementById('caption');
    const closeBtn = document.getElementsByClassName('close')[0];

    // 假設我們有一個包含食材名稱和圖片的數組
    const ingredients = [
        { name: 'Apple 蘋果', image: '/static/images/apple.png' },
        { name: 'Apricot 杏子', image: '/static/images/apricot.png' },
        { name: 'Avocado 酪梨', image: '/static/images/avocado.png' },
        { name: 'Banana 香蕉', image: '/static/images/banana.png' },
        { name: 'Blackberry 黑莓', image: '/static/images/blackberry.png' },
        { name: 'Blueberry 藍莓', image: '/static/images/blueberry.png' },
        { name: 'Cantaloupe 哈密瓜', image: '/static/images/cantaloupe.png' },
        { name: 'Cherry 櫻桃', image: '/static/images/cherry.png' },
        { name: 'Clementine 克萊門氏小柑橘', image: '/static/images/clementine.png' },
        { name: 'Cocoanut 椰子', image: '/static/images/coconut.png' },
        { name: 'Date fruit 棗子', image: '/static/images/datefruit.png' },
        { name: 'Fig fruit 無花果', image: '/static/images/figfruit.png' },
        { name: 'Strawberry 草莓', image: '/static/images/strawberry.png' },
        { name: 'Grape 葡萄', image: '/static/images/grape.png' },
        { name: 'Kiwi fruit 奇異果', image: '/static/images/kiwifruit.png' },
        { name: 'Lemon 檸檬', image: '/static/images/lemon.png' },
        { name: 'Lime 酸橙', image: '/static/images/lime.png' },
        { name: 'Mandarin orange 橘子', image: '/static/images/mandarinorange.png' },
        { name: 'Orange fruit 橙子', image: '/static/images/orangefruit.png' },
        { name: 'Papaya 木瓜', image: '/static/images/papaya.png' },
        { name: 'Peach 桃子', image: '/static/images/peach.png' },
        { name: 'Pear 梨', image: '/static/images/pear.png' },
        { name: 'Persimmon 柿子', image: '/static/images/persimmon.png' },
        { name: 'Pineapple 鳳梨', image: '/static/images/pineapple.png' },
        { name: 'Raspberry 覆盆子', image: '/static/images/raspberry.png' },
        { name: 'Watermelon 西瓜', image: '/static/images/watermelon.png' },
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