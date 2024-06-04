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
    });

    // Generar dataset y mostrar en tabla
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Obtener valores del formulario
        const totalRows = document.getElementById('totalRows').value;
        const columnConfigs = Array.from(columnsContainer.getElementsByClassName('columnConfig'));
        const columns = columnConfigs.map(columnConfig => ({
            columnName: columnConfig.querySelector('input[name="columnName"]').value,
            dataType: columnConfig.querySelector('select[name="dataType"]').value,
            minValue: columnConfig.querySelector('input[name="minValue"]').value,
            maxValue: columnConfig.querySelector('input[name="maxValue"]').value,
            pattern: columnConfig.querySelector('select[name="variationPattern"]').value
        }));

        // Generar y guardar datos sintéticos
        const data = generateData(totalRows, columns);
        await saveDataToServer(data);

        // Mostrar datos en tabla
        displayDataInTable(data, dataTable);

        // Habilitar botón de exportación
        exportCsvBtn.disabled = false;
    });

    // Exportar datos a CSV
    exportCsvBtn.addEventListener('click', () => {
        const data = getDataFromTable(dataTable);
        exportToCsv(data, 'dataset.csv');
    });
});

// Función para generar datos sintéticos
function generateData(totalRows, columns) {
    const data = [];
    for (let i = 0; i < totalRows; i++) {
        const row = {};
        columns.forEach(column => {
            switch (column.dataType) {
                case 'temperature':
                case 'humidity':
                    row[column.columnName] = generateNumericValue(column.minValue, column.maxValue, column.pattern, i);
                    break;
                case 'date':
                    row[column.columnName] = generateDateValue(column.pattern, i);
                    break;
            }
        });
        data.push(row);
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

function generateDateValue(pattern, index) {
    const date = new Date();
    switch (pattern) {
        case 'constant':
            return date.toISOString();
        case 'linear':
            date.setDate(date.getDate() + index);
            return date.toISOString();
        case 'sinusoidal':
        case 'random':
            date.setDate(date.getDate() + Math.random() * 10);
            return date.toISOString();
    }
}

// Función para mostrar datos en tabla
function displayDataInTable(data, table) {
    // Limpiar tabla existente
    table.innerHTML = '';

    // Crear encabezado
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    Object.keys(data[0]).forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    });

    // Crear filas de datos
    const tbody = table.createTBody();
    data.forEach(row => {
        const dataRow = tbody.insertRow();
        Object.values(row).forEach(value => {
            const cell = dataRow.insertCell();
            cell.textContent = value;
        });
    });
}

// Función para obtener datos de la tabla
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

// Función para exportar datos a CSV
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

// Función para guardar datos en el servidor
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
