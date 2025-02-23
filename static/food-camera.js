const confirmButton = document.getElementById('confirm-button');
confirmButton.classList.add('hidden');
let ingr_count = 0
let recipeGeneratedconfirmed = 0;
let currentIngredients = [];

document.addEventListener('DOMContentLoaded', async function () {
    const video = document.getElementById('video');
    const captureBtn = document.getElementById('capture-btn');
    const modelSelect = document.querySelector('.model-selector'); // 確保選擇正確的模型選擇器
    let cameraStream = null;

    // 啟動相機
    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraStream = stream;
            video.srcObject = stream;
        } catch (error) {
            console.error('相機啟動失敗:', error);
            document.getElementById('camera-warning').classList.remove('hidden');
            alert(`相機啟動失敗: ${error.message}`);
        }
    }

    await startCamera();

    // 捕捉影像並傳送給後端
    async function captureImage() {
        const selectedModel = modelSelect.value;
        if (!selectedModel || selectedModel === "請選擇掃描模型") {
            // alert('請選擇一個模型');
            return;
        }

        if (video.videoWidth === 0 || video.videoHeight === 0) {
            // alert('視頻加載中，請稍後再試。');
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        let imageData = canvas.toDataURL('image/jpeg'); // 轉換為 base64

        try {
            const response = await fetch(`/capture?model=${selectedModel}`, {
                method: 'POST', // 修正錯誤的 HTTP 方法
                headers: {
                    'Content-Type': 'application/json' // 確保為 JSON 格式
                },
                body: JSON.stringify({ image: imageData }) // 傳送圖片數據
            });

            if (!response.ok) {
                throw new Error(`後端錯誤：${response.statusText}`);
            }

            const data = await response.json(); // 直接解析 JSON
            console.log('後端回應內容:', data);
            displayIngredients(data.detected_items); // 顯示掃描到的食材
            
            if (data.error) {
                alert(`錯誤: ${data.message}`);
            } else {
                // alert('影像擷取成功');
            }
        } catch (error) {
            console.error('錯誤:', error);
            alert(`錯誤: ${error.message}`);
        }
    }

    function displayIngredients(items) {
        const ingredientCarousel = document.querySelector('.ingredient-carousel');
        ingredientCarousel.innerHTML = '';
        ingredient_detected = 1;
        
        // Initialize current ingredients with the provided items
        currentIngredients = items.map(item => item.name);
        
        if (items.length === 0) {
            confirmButton.classList.add('hidden');
            // Instead of showing "no ingredients" message, we'll just show the add card
        } else {
            confirmButton.classList.remove('hidden');
            // Display existing ingredients
            items.forEach(item => {
                ingr_count = ingr_count + 1;
                const card = document.createElement('div');
                card.classList.add('ingredient-card');
                
                const imageName = String(item.name).toLowerCase() + ".png";
                const imagePath = `/static/images/${imageName}`;
    
                card.innerHTML = `
                    <img src="${imagePath}" alt="${item.name}" onerror="this.onerror=null;this.src='/static/images/default.jpeg';">
                    <div class="ingredient-details">
                        <h3>${item.name}</h3>
                    </div>
                `;
                
                // Add click event for deletion
                card.addEventListener('click', () => confirmDeleteIngredient(item.name));
                ingredientCarousel.appendChild(card);            
            });
        }
    
        // Always add the empty card for new ingredients
        const addCard = document.createElement('div');
        addCard.classList.add('ingredient-card', 'add-card');
        const defaultImagePath = '/static/images/plus.png';
        addCard.innerHTML = `
            <img src="${defaultImagePath}" alt="新增食材" onerror="this.onerror=null;this.src='/static/images/default.jpeg';">
            <div class="ingredient-details">
                <h3>點擊以新增食材</h3>
            </div>
        `;
        addCard.addEventListener('click', addCustomIngredient);
        ingredientCarousel.appendChild(addCard);

    }

    captureBtn.addEventListener('click', async function() {
        await captureImage();  // 等待 captureImage 完成
        goToNextSlide();       // 再執行 goToNextSlide
    });
    
});

function confirmDeleteIngredient(ingredientName) {
    if (confirm(`是否要刪除食材 "${ingredientName}"？`)) {
        // Remove from current ingredients list
        currentIngredients = currentIngredients.filter(name => name !== ingredientName);
        
        // Remove the card from display
        const cards = document.querySelectorAll('.ingredient-card');
        cards.forEach(card => {
            if (card.querySelector('h3').textContent === ingredientName) {
                card.remove();
            }
        });
        
        ingr_count = ingr_count - 1;
        
        if (ingr_count === 0) {
            confirmButton.classList.add('hidden');
        }

        // Update UI based on remaining ingredients
        const remainingCards = document.querySelectorAll('.ingredient-card:not(.add-card)');
    }
}


// 用戶點擊空白圖卡後，彈出輸入框讓用戶輸入食材名稱
function addCustomIngredient() {
    const ingredientName = prompt('請輸入食材名稱:').toLowerCase();

    if (ingredientName) {
        const imageName = ingredientName.toLowerCase() + ".png";
        const imagePath = `/static/images/${imageName}`;
        const ingredientCarousel = document.querySelector('.ingredient-carousel');

        confirmButton.classList.remove('hidden');
        ingr_count = ingr_count + 1;

        const card = document.createElement('div');
        card.classList.add('ingredient-card');

        card.innerHTML = `
            <img src="${imagePath}" alt="${ingredientName}" onerror="this.onerror=null;this.src='/static/images/default.jpeg';">
            <div class="ingredient-details">
                <h3>${ingredientName}</h3>
            </div>
        `;
        card.addEventListener('click', () => confirmDeleteIngredient(ingredientName));
        ingredientCarousel.insertBefore(card, ingredientCarousel.lastElementChild); // 在空白卡片之前插入新卡片
        currentIngredients.push(ingredientName);
    }
}

// 傳送新增食材的資料給後端
async function sendIngredientToBackend() {
    try {
        const response = await fetch('/updateIngredients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ingredients: currentIngredients })
        });

        if (!response.ok) {
            throw new Error(`後端錯誤：${response.statusText}`);
        }

        const data = await response.json();
        console.log('後端回應內容:', data);

    } catch (error) {
        console.error('錯誤:', error);
        alert(`錯誤: ${error.message}`);
    }
}

document.getElementById('confirm-button').addEventListener('click', async function() {
    let loadingMessage = null;
    try {
        if (recipeGeneratedconfirmed === 1) {
            // 刪除所有 recipe-slide sections
            const recipeSlides = document.querySelectorAll('section.slide.recipe-slide');
            recipeSlides.forEach(slide => slide.remove());
        }
        confirmButton.classList.add('hidden');
        loadingMessage = document.createElement('div');
        loadingMessage.classList.add('recipe-loading-message');
        loadingMessage.textContent = '正在生成食譜...';
        document.body.appendChild(loadingMessage);
        // 先等待食材列表更新完成
        await sendIngredientToBackend(currentIngredients);

        // 發送請求生成食譜
        const response = await fetch('/generateRecipe');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // 記錄成功訊息
        console.log("成功生成食譜:", data.message);
        console.log("食譜內容:", data.recipe);
        console.log("圖片 URL:", data.image_url);

        // 更新所有食譜圖片
        const recipeImages = document.querySelectorAll('.recipe-image img');
        if (!recipeImages.length) {
            throw new Error('找不到食譜圖片元素');
        }

        // 創建一個Promise陣列來等待所有圖片載入
        const imageLoadPromises = Array.from(recipeImages).map(recipeImage => {
            return new Promise((resolve, reject) => {
                recipeImage.onload = resolve;
                recipeImage.onerror = () => reject(new Error('圖片載入失敗'));
                recipeImage.src = data.image_url;
            });
        });

        // 等待所有圖片載入完成
        await Promise.all(imageLoadPromises);

        // 更新食譜內容
        await displayRecipe(data.recipe);

        recipeGeneratedconfirmed = 1;
        updateSlides();
        // 確保所有更新都完成後才跳轉
        if (typeof goToNextSlide === 'function') {
            goToNextSlide();
        }

    } catch (error) {
        console.error("請求失敗:", error);
        alert("請求失敗：" + error.message);
    } finally {
        // 無論成功或失敗都移除載入提示
        if (loadingMessage) {
            loadingMessage.remove(); // 使用 remove() 完全移除元素，而不是只是隱藏
        }
    }
});

async function displayRecipe(recipeContent) {
    const container = document.getElementById('slideshow-container');
    document.getElementById('recipe-content-0').innerHTML = recipeContent[0];
    // 動態生成 recipe slides
    recipeContent.forEach((content, index) => {
        if (index>=1) {
            let section = document.createElement('section');
            section.className = 'slide recipe-slide';
            
            let div = document.createElement('div');
            div.id = `recipe-content-${index}`;
            div.className = 'custom-list';
            div.innerHTML = content;
            
            section.appendChild(div);
            
            // 獲取倒數第二個子元素的索引
            const positionIndex = container.children.length - 3;
            // 在倒數第二個子元素之前插入 section
            if (positionIndex >= 0) {
                container.insertBefore(section, container.children[positionIndex]);
            } else {
                // 如果沒有足夠的子元素，則直接 append 到 container
                container.appendChild(section);
            }
        }
    });
    
    
    // 顯示下一步按鈕
    const nextButton = document.querySelector('.next-slide-btn');
    if (nextButton) {
        nextButton.classList.remove('hidden');
    }
}