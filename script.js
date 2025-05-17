let childrenData = [];  // Данные о детях, рожденных вне брака
let totalBirthsData = []; // Общее число рождений
let exchangeRates = {}; // Курсы валют

// Функция для загрузки данных из JSON файлов
async function loadData() {
    try {
        // Загрузка данных о детях (nobrak.json или childrenData.json)
        const childrenResponse = await fetch('data/childrenData.json');
        if (!childrenResponse.ok) {
            throw new Error('Не удалось загрузить данные о детях');
        }
        childrenData = await childrenResponse.json();

        // Загрузка данных об общем числе рождений (totalBirthsData.json)
        const totalBirthsResponse = await fetch('data/totalBirthsData.json');
        if (!totalBirthsResponse.ok) {
            throw new Error('Не удалось загрузить данные о рождении');
        }
        totalBirthsData = await totalBirthsResponse.json();

        // Загрузка данных о курсах валют (exchangeRates.json)
        const exchangeRatesResponse = await fetch('data/exchangeRates.json');
        if (!exchangeRatesResponse.ok) {
            throw new Error('Не удалось загрузить данные о курсах валют');
        }
        exchangeRates = await exchangeRatesResponse.json();

        // Отображение таблицы и графика после загрузки данных
        displayTable();
        displayChart();
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        alert('Не удалось загрузить данные. Попробуйте позже.');
    }
}

// Функция для отображения данных в таблице
function displayTable() {
    const tableBody = document.getElementById("data-table").getElementsByTagName("tbody")[0];

    // Очистим таблицу перед добавлением новых данных
    tableBody.innerHTML = "";

    childrenData.forEach((data, index) => {
        const year = data.year;
        const childrenOutOfWedlock = data.children_born_out_of_wedlock;
        const totalBirths = totalBirthsData[index].total_births;
        const percentageOutOfWedlock = (childrenOutOfWedlock / totalBirths) * 100;

        // Создаем строку таблицы
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${year}</td>
            <td>${childrenOutOfWedlock}</td>
            <td>${totalBirths}</td>
            <td>${percentageOutOfWedlock.toFixed(2)}%</td>
        `;
    });
}

// Функция для создания графика
function displayChart() {
    const ctx = document.getElementById('myChart').getContext('2d');

    const years = childrenData.map(item => item.year);
    const childrenOutOfWedlock = childrenData.map(item => item.children_born_out_of_wedlock);
    const totalBirths = totalBirthsData.map(item => item.total_births);
    const percentages = childrenOutOfWedlock.map((children, index) => (children / totalBirths[index]) * 100);

    new Chart(ctx, {
        type: 'line', // Тип графика (можно выбрать 'bar', 'line', 'pie', и т.д.)
        data: {
            labels: years, // Метки для оси X
            datasets: [{
                label: 'Процент детей, рожденных вне брака',
                data: percentages, // Данные для оси Y
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Год'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Процент'
                    },
                    min: 0,
                    max: 100
                }
            }
        }
    });
}

// Функция для расчета штрафа
async function calculatePenalty() {
    const selectedYear = document.getElementById("year").value;
    
    if (!selectedYear) {
        alert("Пожалуйста, выберите год.");
        return;
    }

    // Найти данные для выбранного года
    const childrenInfo = childrenData.find(item => item.year == selectedYear);
    const totalBirthsInfo = totalBirthsData.find(item => item.year == selectedYear);

    if (!childrenInfo || !totalBirthsInfo) {
        alert("Нет данных для выбранного года.");
        return;
    }

    const childrenOutOfWedlock = childrenInfo.children_born_out_of_wedlock;
    const totalBirths = totalBirthsInfo.total_births;

    // Рассчитываем процент детей, рожденных вне брака
    const percentageOutOfWedlock = (childrenOutOfWedlock / totalBirths) * 100;

    // Штраф (например, 1000 рублей за каждого ребенка)
    const penaltyRub = childrenOutOfWedlock * 1000;

    // Конвертируем в другие валюты
    const penaltyUsd = penaltyRub * exchangeRates.USD;
    const penaltyEur = penaltyRub * exchangeRates.EUR;

    // Отображаем результаты
    const resultElement = document.getElementById("result");
    resultElement.style.display = "block"; // Показываем блок с результатами
    resultElement.innerHTML = `
        <strong>Год:</strong> ${selectedYear}<br>
        <strong>Общее количество рождений:</strong> ${totalBirths}<br>
        <strong>Количество детей, рожденных вне брака:</strong> ${childrenOutOfWedlock}<br>
        <strong>Процент детей, рожденных вне брака:</strong> ${percentageOutOfWedlock.toFixed(2)}%<br>
        <strong>Штраф (в рублях):</strong> ${penaltyRub}<br>
        <strong>Штраф (в USD):</strong> ${penaltyUsd.toFixed(2)}<br>
        <strong>Штраф (в EUR):</strong> ${penaltyEur.toFixed(2)}<br>
    `;
}

// Загружаем данные при старте страницы
loadData();
