const video = document.getElementById('video');
const captureBtn = document.getElementById('capture-btn');
const cameraWarning = document.getElementById('camera-warning');

// 取得預覽區域元素
const previewArea = document.querySelector('.preview-area');

// 抓取或創建擷取圖片的元素
let capturedImage = document.getElementById('captured-image');

if (!capturedImage) {
    // 如果沒有現有的 <img> 元素，則動態創建
    capturedImage = document.createElement('img');
    capturedImage.id = 'captured-image';
    previewArea.appendChild(capturedImage); // 插入到 preview-area 內
}

// 啟動攝像頭
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.style.opacity = '1'; // 使視頻元素可見
        cameraWarning.style.display = 'none';

        // 確保視頻開始播放
        video.play();
    } catch (err) {
        console.error('Error accessing camera:', err);
        cameraWarning.style.display = 'block';
    }
}

// 拍照功能
function captureImage() {
    if (!video.srcObject || video.videoWidth === 0 || video.videoHeight === 0) {
        alert("攝像頭尚未準備好，無法捕捉圖片");
        return;
    }

    // 當前視頻畫面的寬高
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 將捕獲的圖片轉換為數據 URL，並顯示出來
    const imageUrl = canvas.toDataURL('image/png');
    capturedImage.src = imageUrl;
    capturedImage.style.display = 'block'; // 顯示擷取的圖片

    // 隱藏攝像頭畫面
    video.style.display = 'none';
}

// 頁面加載時啟動攝像頭
document.addEventListener('DOMContentLoaded', startCamera);

// 點擊按鈕捕捉影像
captureBtn.addEventListener('click', captureImage);