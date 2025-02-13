let slideIndex = 1;
let isAnimating = false;

// 初始化顯示
showSlides(slideIndex);
startAutoSlide();

// 自動輪播
function startAutoSlide() {
    setInterval(() => {
        plusSlides(1);
    }, 10000); // 每10秒切換一次
}

// 切換控制
function plusSlides(n) {
    if (isAnimating) return;
    isAnimating = true;

    let slides = document.getElementsByClassName("mySlides");
    let currentSlide = slides[slideIndex - 1];
    
    // 計算下一張幻燈片的索引
    let nextIndex = slideIndex + n;
    if (nextIndex > slides.length) nextIndex = 1;
    if (nextIndex < 1) nextIndex = slides.length;
    
    let nextSlide = slides[nextIndex - 1];
    
    // 設置初始位置
    nextSlide.style.transform = 'translateX(100%)';
    nextSlide.style.display = 'block';
    nextSlide.style.transition = 'transform 0.5s ease-out';
    
    // 強制瀏覽器重繪
    nextSlide.offsetHeight;
    
    // 執行滑動動畫
    currentSlide.style.transition = 'transform 0.5s ease-out';
    currentSlide.style.transform = 'translateX(-100%)';
    nextSlide.style.transform = 'translateX(0)';
    
    // 動畫結束後清理
    setTimeout(() => {
        currentSlide.style.display = 'none';
        currentSlide.style.transform = '';
        currentSlide.style.transition = '';
        nextSlide.style.transition = '';
        slideIndex = nextIndex;
        isAnimating = false;
    }, 500);
}

// 基本顯示函數
function showSlides(n) {
    let slides = document.getElementsByClassName("mySlides");
    
    if (n > slides.length) slideIndex = 1;
    if (n < 1) slideIndex = slides.length;
    
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
        slides[i].style.transform = '';
    }
    
    slides[slideIndex-1].style.display = "block";
}