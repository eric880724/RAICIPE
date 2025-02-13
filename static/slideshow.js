// 等待 DOM 完全加載
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    
    // 初始化顯示第一個幻燈片
    function initSlides() {
        slides.forEach((slide, index) => {
            if (index === 0) {
                slide.classList.add('active');
            } else {
                slide.style.transform = `translate${index === 1 ? 'X(100%)' : 'Y(100%)'}`;
            }
        });
        updateProgressBar();
    }

    // 更新進度條
    function updateProgressBar() {
        const progressBar = document.querySelector('.progress-bar');
        const steps = document.querySelectorAll('.step');
        
        progressBar.style.setProperty('--progress', `${(currentSlide / (slides.length - 1)) * 100}%`);
        
        steps.forEach((step, index) => {
            if (index <= currentSlide) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    // 切換到下一個幻燈片
    function goToNextSlide() {
        if (currentSlide >= slides.length - 1) return;
        
        const currentElement = slides[currentSlide];
        const nextElement = slides[currentSlide + 1];
        
        // 決定滑動方向
        const isHorizontal = currentSlide === 0;
        const direction = isHorizontal ? 'X' : 'Y';
        
        // 當前幻燈片向左/上滑出
        currentElement.style.transform = `translate${direction}(-100%)`;
        currentElement.classList.remove('active');
        
        // 下一個幻燈片滑入
        nextElement.style.transform = 'translate(0)';
        nextElement.classList.add('active');
        
        currentSlide++;
        updateProgressBar();
    }

    // 返回上一個幻燈片
    function goToPrevSlide() {
        if (currentSlide <= 0) return;
        
        const currentElement = slides[currentSlide];
        const prevElement = slides[currentSlide - 1];
        
        // 決定滑動方向
        const isHorizontal = currentSlide === 1;
        const direction = isHorizontal ? 'X' : 'Y';
        
        // 當前幻燈片向右/下滑出
        currentElement.style.transform = `translate${direction}(100%)`;
        currentElement.classList.remove('active');
        
        // 上一個幻燈片滑入
        prevElement.style.transform = 'translate(0)';
        prevElement.classList.add('active');
        
        currentSlide--;
        updateProgressBar();
    }

    // 觸摸滑動支持
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', function(event) {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
    });

    document.addEventListener('touchend', function(event) {
        touchEndX = event.changedTouches[0].clientX;
        touchEndY = event.changedTouches[0].clientY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        // 檢測滑動方向
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // 水平滑動
            if (deltaX < -50 && currentSlide === 0) {
                goToNextSlide();
            } else if (deltaX > 50 && currentSlide === 1) {
                goToPrevSlide();
            }
        } else {
            // 垂直滑動
            if (deltaY < -50 && currentSlide === 1) {
                goToNextSlide();
            } else if (deltaY > 50 && currentSlide === 2) {
                goToPrevSlide();
            }
        }
    });

    // 添加按鈕事件監聽器（如果需要）
    const nextButton = document.createElement('button');
    nextButton.classList.add('next-slide-btn');
    nextButton.textContent = '❯';
    nextButton.addEventListener('click', goToNextSlide);

    const prevButton = document.createElement('button');
    prevButton.classList.add('prev-slide-btn');
    prevButton.textContent = '❮';
    prevButton.addEventListener('click', goToPrevSlide);

    document.querySelector('.slideshow-container').appendChild(nextButton);
    document.querySelector('.slideshow-container').appendChild(prevButton);

    // 初始化幻燈片
    initSlides();
});