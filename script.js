let basePrice = 0;
let addonsPrice = 0;
let sausagePrice = 0;
let cart = [];

function openPopup(title, description, price, imageUrl) {
    const popup = document.getElementById('popup');
    popup.scrollTop = 0;
    document.getElementById('popupTitle').textContent = title;
    document.getElementById('popupDescription').textContent = description;
    document.getElementById('popupImage').style.backgroundImage = `url('${imageUrl}')`;
    basePrice = price;

    // Сброс выбранных опций
    document.querySelectorAll('.size-option').forEach((el, index) => {
        el.classList.remove('active');
        if (index === 0) el.classList.add('active');
    });

    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    sausagePrice = 0;
    addonsPrice = 0;
    calculateTotal();

    document.getElementById('popup').classList.add('active');
}


function selectSausage(element, price) {
    document.querySelectorAll('.size-option').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    sausagePrice = price;
    calculateTotal();
}

function calculateTotal() {
    addonsPrice = 0;
    if (document.getElementById('addon1').checked) addonsPrice += 79;
    if (document.getElementById('addon2').checked) addonsPrice += 49;
    if (document.getElementById('addon3').checked) addonsPrice += 79;

    const total = basePrice + sausagePrice + addonsPrice;
    document.getElementById('totalPrice').textContent = `В корзину за ${total} ₽`;
}

// Закрытие попапа при клике на оверлей
document.getElementById('popup').addEventListener('click', function (e) {
    if (e.target === this) {
        closePopup();
    }
});
const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('previewImage');
const removeBtn = document.getElementById('removeBtn');


// Обработка удаления фото
removeBtn.addEventListener('click', function () {
    fileInput.value = '';
    previewImage.src = '#';
    previewContainer.style.display = 'none';
    uploadBox.style.display = 'block';
    uploadBox.classList.remove('active');
});

// Обработка перетаскивания файлов
uploadBox.addEventListener('dragover', function (e) {
    e.preventDefault();
    this.classList.add('active');
});

uploadBox.addEventListener('dragleave', function () {
    this.classList.remove('active');
});

uploadBox.addEventListener('drop', function (e) {
    e.preventDefault();
    this.classList.remove('active');

    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        const event = new Event('change');
        fileInput.dispatchEvent(event);
    }
});


const downloadBtn = document.getElementById('downloadBtn');
const contrastSlider = document.getElementById('contrastSlider');
const contrastValue = document.getElementById('contrastValue');
const thresholdSlider = document.getElementById('thresholdSlider');
const thresholdValue = document.getElementById('thresholdValue');
const controls = document.getElementById('controls');

let originalImageData = null;
let canvas = document.createElement('canvas');
let ctx = canvas.getContext('2d');

// Обработка клика по области загрузки
uploadBox.addEventListener('click', () => {
    fileInput.click();
});

// Обработка изменения файла
fileInput.addEventListener('change', function () {
    if (this.files && this.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                // Сохраняем оригинальные размеры
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Рисуем изображение на canvas
                ctx.drawImage(img, 0, 0);

                // Сохраняем оригинальные данные изображения
                originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                // Обрабатываем изображение
                processImage();
                
                // Показываем превью
                previewContainer.style.display = 'block';
                uploadBox.style.display = 'none';
                controls.style.display = 'block';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(this.files[0]);
    }
});

// Обработка удаления фото
removeBtn.addEventListener('click', function () {
    fileInput.value = '';
    previewImage.src = '#';
    previewContainer.style.display = 'none';
    uploadBox.style.display = 'block';
    controls.style.display = 'none';
    originalImageData = null;
});

// Обработка перетаскивания файлов
uploadBox.addEventListener('dragover', function (e) {
    e.preventDefault();
    this.style.borderColor = '#4CAF50';
});

uploadBox.addEventListener('dragleave', function () {
    this.style.borderColor = '#ccc';
});

uploadBox.addEventListener('drop', function (e) {
    e.preventDefault();
    this.style.borderColor = '#ccc';

    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        const event = new Event('change');
        fileInput.dispatchEvent(event);
    }
});

// Обработка изменения контрастности
contrastSlider.addEventListener('input', function () {
    contrastValue.textContent = this.value;
    if (originalImageData) processImage();
});

// Обработка изменения порога
thresholdSlider.addEventListener('input', function () {
    thresholdValue.textContent = this.value;
    if (originalImageData) processImage();
});
// Обработка изображения
function processImage() {
    if (!originalImageData) return;

    // Создаем копию оригинальных данных
    const imageData = new ImageData(
        new Uint8ClampedArray(originalImageData.data),
        originalImageData.width,
        originalImageData.height
    );
    const data = imageData.data;
    
    // Получаем текущие значения настроек
    const contrast = parseInt(contrastSlider.value) / 100;
    const threshold = parseInt(thresholdSlider.value);
    
    // Применяем контрастность и преобразуем в черно-белое
    for (let i = 0; i < data.length; i += 4) {
        // Применяем контрастность к каждому каналу
        const applyContrast = (value) => {
            const factor = (259 * (contrast * 100 + 255)) / (255 * (259 - contrast * 100));
            return factor * (value - 128) + 128;
        };

        const r = applyContrast(data[i]);
        const g = applyContrast(data[i + 1]);
        const b = applyContrast(data[i + 2]);

        // Вычисляем яркость с учетом контраста
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

        // Бинаризация с учетом порога
        const bwValue = brightness > threshold ? 255 : 0;
        
        // Устанавливаем значения для всех каналов
        if (bwValue === 255) {
            data[i] = data[i + 1] = data[i + 2] = 0; // Make white transparent
            data[i + 3] = 0; // Set alpha channel to 0
        } else {
            data[i] = data[i + 1] = data[i + 2] = bwValue;
        }
    }

    // Отображаем результат
    ctx.putImageData(imageData, 0, 0);
    previewImage.src = canvas.toDataURL();
}




function addToCart() {
    closePopup();
}


function selectPrintOption(element, type) {
    document.querySelectorAll('.print-option').forEach(el => el.classList.remove('active'));
    element.classList.add('active');

    if (type === 'file') {
        document.getElementById('file').style.display = 'block';
        document.getElementById('draw').style.display = 'none';
    } else if (type === 'draw') {
        document.getElementById('draw').style.display = 'block';
        document.getElementById('file').style.display = 'none';
    }
}
const canvas_a = document.getElementById('drawingCanvas');
const ctx_a = canvas_a.getContext('2d', { willReadFrequently: true }); // Добавляем оптимизацию
const clearBtn = document.getElementById('clearBtn');
const colorPicker = document.getElementById('color');
const sizeSlider = document.getElementById('size');
const sizeValue = document.getElementById('sizeValue');

let isDrawing = false;
let currentColor = '#000000';
let currentSize = 5;

// Настройки прозрачного холста
function initCanvas() {
    // Очищаем с прозрачностью
    ctx_a.clearRect(0, 0, canvas_a.width, canvas_a.height);
    ctx_a.strokeStyle = currentColor;
    ctx_a.lineWidth = currentSize;
    ctx_a.lineCap = 'round';
    ctx_a.lineJoin = 'round';
    ctx_a.globalCompositeOperation = 'source-over'; // Стандартный режим рисования
}

// Инициализация при загрузке
initCanvas();

// Обработчики событий
canvas_a.addEventListener('mousedown', startDrawing);
canvas_a.addEventListener('mousemove', draw);
canvas_a.addEventListener('mouseup', stopDrawing);
canvas_a.addEventListener('mouseout', stopDrawing);

// Для мобильных устройств
canvas_a.addEventListener('touchstart', handleTouch);
canvas_a.addEventListener('touchmove', handleTouch);
canvas_a.addEventListener('touchend', stopDrawing);

clearBtn.addEventListener('click', clearCanvas);
sizeSlider.addEventListener('input', updateSize);

// Функции
function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

function draw(e) {
    if (!isDrawing) return;
    
    ctx_a.strokeStyle = currentColor;
    ctx_a.lineWidth = currentSize;
    
    const rect = canvas_a.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    ctx_a.lineTo(x, y);
    ctx_a.stroke();
    ctx_a.beginPath();
    ctx_a.moveTo(x, y);
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(
        e.type === 'touchstart' ? 'mousedown' : 'mousemove',
        {
            clientX: touch.clientX,
            clientY: touch.clientY
        }
    );
    canvas_a.dispatchEvent(mouseEvent);
}

function stopDrawing() {
    isDrawing = false;
    ctx_a.beginPath();
}

function clearCanvas() {
    // Очищаем с прозрачностью
    ctx_a.clearRect(0, 0, canvas_a.width, canvas_a.height);
    ctx_a.beginPath();
}

function updateColor(e) {
    currentColor = e.target.value;
}

function updateSize(e) {
    currentSize = e.target.value;
    sizeValue.textContent = currentSize;
}

// Для корректного отображения прозрачности в CSS
canvas_a.style.backgroundColor = 'transparent';
function closePopup() {
    document.getElementById('popup').classList.remove('active');
    popup.scrollTop = 0;
    fileInput.value = '';
    previewImage.src = '#';
    previewContainer.style.display = 'none';
    uploadBox.style.display = 'block';
    uploadBox.classList.remove('active');
    clearCanvas();
}