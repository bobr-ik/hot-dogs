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
function closePopup() {
    document.getElementById('popup').classList.remove('active');
    popup.scrollTop = 0;
    fileInput.value = '';
    previewImage.src = '#';
    previewContainer.style.display = 'none';
    uploadBox.style.display = 'block';
    uploadBox.classList.remove('active');
}