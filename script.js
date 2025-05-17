async function analyzeData() {
    const response = await fetch('http://localhost:5000/analyze_births', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            children_data: 'path/to/childrenData.json',  // Путь к файлу JSON
            total_births_data: 'path/to/totalBirthsData.json',
            forecast_years: 5  // Прогноз на 5 лет
        })
    });
    const result = await response.json();
    console.log(result);

    // Для отображения графика
    document.getElementById('birthsPlot').src = `data:image/png;base64,${result.plot_base64}`;
}
