document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('dataConfigForm');
    const columnsContainer = document.getElementById('columnsContainer');
    const addColumnBtn = document.getElementById('addColumnBtn');
    const dataTable = document.getElementById('dataTable');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    
    // Agregar nueva columna
    addColumnBtn.addEventListener('click', () => {
        const columnConfig = document.createElement('div');
        columnConfig.classList.add('columnConfig');
        columnConfig.innerHTML = `
            <label for="columnName">Nombre de la columna:</label>
            <input type="text" name="columnName" required>
            <br>
            <label for="dataType">Tipo de dato:</label>
            <select name="dataType" required>
                <option value="temperature">Temperatura (°C)</option>
                <option value="humidity">Humedad (%)</option>
                <option value="pressure">Presión (hPa)</option>
                <option value="windSpeed">Velocidad del Viento (m/s)</option>
                <option value="windDirection">Dirección del Viento (°)</option>
                <option value="precipitation">Precipitación (mm)</option>
                <option value="date">Fecha</option>
            </select>
            <br>
            <div class="numericConfig">
                <label for="minValue">Valor mínimo:</label>
                <input type="number" name="minValue">
                <br>
                <label for="maxValue">Valor máximo:</label>
                <input type="number" name="maxValue">
                <br>
            </div>
            <label for="variationPattern">Patrón de variación:</label>
            <select name="variationPattern" required>
                <option value="constant">Constante</option>
                <option value="linear">Lineal</option>
                <option value="sinusoidal">Senoidal</option>
                <option value="random">Aleatorio</option>
            </select>
            <br>
            <button type="button" class="removeColumnBtn">Eliminar Columna</button>
        `;
        columnsContainer.appendChild(columnConfig);
        
        columnConfig.querySelector('.removeColumnBtn').addEventListener('click', () => {
            columnsContainer.removeChild(columnConfig);
        });

        columnConfig.querySelector('select[name="dataType"]').addEventListener('change', (event) => {
            const numericConfig = columnConfig.querySelector('.numericConfig');
            if (event.target.value === 'date') {
                numericConfig.style.display = 'none';
            } else {
                numericConfig.style.display = 'block';
            }
        });
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const totalRows = document.getElementById('totalRows').value;
        const frequency = document.getElementById('frequency').value;
        const columnConfigs = Array.from(columnsContainer.getElementsByClassName('columnConfig'));
        const columns = columnConfigs.map(columnConfig => ({
            columnName: columnConfig.querySelector('input[name="columnName"]').value,
            dataType: columnConfig.querySelector('select[name="dataType"]').value,
            minValue: columnConfig.querySelector('input[name="minValue"]').value,
            maxValue: columnConfig.querySelector('input[name="maxValue"]').value,
            pattern: columnConfig.querySelector('select[name="variationPattern"]').value
        }));

        const data = generateData(totalRows, columns, frequency);
        await saveDataToServer(data);
        displayDataInTable(data, dataTable);
        exportCsvBtn.disabled = false;
    });

    exportCsvBtn.addEventListener('click', () => {
        const data = getDataFromTable(dataTable);
        exportToCsv(data, 'dataset.csv');
    });
});

function generateData(totalRows, columns, frequency) {
    const data = [];
    let currentDate = new Date(); // Fecha inicial
    for (let i = 1; i <= totalRows; i++) {
        const row = { ID: i, Fecha: new Date(currentDate) }; // Agregar columna "ID" e "Fecha"
        let tempHumSet = false; // Bandera para verificar si ya se generaron los valores relacionados
        let temperature, humidity;

        columns.forEach(column => {
            let columnName = column.columnName;
            let value;

            if (column.dataType === 'temperature' || column.dataType === 'humidity') {
                if (!tempHumSet) {
                    const relatedValues = generateRelatedValues(
                        column.minValue, column.maxValue, column.minValue, column.maxValue, column.pattern, i
                    );
                    temperature = relatedValues.temperature;
                    humidity = relatedValues.humidity;
                    tempHumSet = true;
                }
                value = (column.dataType === 'temperature') ? temperature : humidity;
                columnName = (column.dataType === 'temperature') ? 'Temperatura (°C)' : 'Humedad (%)';
            } else if (column.dataType === 'date') {
                value = new Date(currentDate);
            } else {
                value = generateNumericValue(column.minValue, column.maxValue, column.pattern, i);
            }

            row[columnName] = value;
        });

        data.push(row);

        switch (frequency) {
            case 'hora':
                currentDate.setHours(currentDate.getHours() + 1); // Incrementar una hora
                break;
            case 'dia':
                currentDate.setDate(currentDate.getDate() + 1); // Incrementar un día
                break;
            // Agregar otros casos según las frecuencias deseadas
        }
    }

    return data;
}

function generateNumericValue(min, max, pattern, index) {
    min = parseFloat(min);
    max = parseFloat(max);
    switch (pattern) {
        case 'constant':
            return (min + max) / 2;
        case 'linear':
            return min + ((max - min) * index) / 100;
        case 'sinusoidal':
            return min + (max - min) / 2 * (1 + Math.sin(index));
        case 'random':
            return min + Math.random() * (max - min);
    }
}

function generateRelatedValues(minTemp, maxTemp, minHumidity, maxHumidity, pattern, index) {
    const temperature = generateNumericValue(minTemp, maxTemp, pattern, index);
    const humidity = maxHumidity - ((temperature - minTemp) / (maxTemp - minTemp)) * (maxHumidity - minHumidity);
    return { temperature, humidity };
}

function displayDataInTable(data, table) {
    table.innerHTML = '';
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    Object.keys(data[0]).forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    });

    const tbody = table.createTBody();
    data.forEach(row => {
        const dataRow = tbody.insertRow();
        Object.values(row).forEach(value => {
            const cell = dataRow.insertCell();
            cell.textContent = value;
        });
    });
}

function getDataFromTable(table) {
    const data = [];
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const rowData = {};
        const cells = row.querySelectorAll('td');
        cells.forEach((cell, index) => {
            rowData[table.querySelectorAll('th')[index].textContent] = cell.textContent;
        });
        data.push(rowData);
    });
    return data;
}

function exportToCsv(data, filename) {
    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(','));

    data.forEach(row => {
        const values = headers.map(header => JSON.stringify(row[header], replacer));
        csvRows.push(values.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function replacer(key, value) {
    return value === null ? '' : value;
}

async function saveDataToServer(data) {
    for (const row of data) {
        await fetch('/api/sensors/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(row)
        });
    }
}
