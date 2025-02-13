// 選取 dropdown 元素
const dropdown = document.querySelector('.dropdown');
const menu = dropdown.querySelector('.menu');

// 當點擊 dropdown 時，切換 active 類別，並顯示/隱藏選單
dropdown.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('active');
});

// 當點擊 menu 內的元素時，阻止事件冒泡
menu.addEventListener('click', (e) => {
    e.stopPropagation();
});

// 當點擊頁面其他地方時，隱藏選單
document.addEventListener('click', (e) => {
    // 如果點擊的不是 dropdown，則移除 active 類別
    if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});