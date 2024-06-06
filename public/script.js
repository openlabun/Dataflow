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
                <option value="pre">Presión (hPa)</option>
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

        displayDataInTable(data, dataTable);
        exportCsvBtn.disabled = false;
    });

    // Exportar datos a CSV
    exportCsvBtn.addEventListener('click', () => {
        const data = getDataFromTable(dataTable);
        exportToCsv(data, 'dataset.csv');
    });

    dataTable.addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-btn')) {
            const row = event.target.closest('tr');
            editRow(row);
        }
    });

    dataTable.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-btn')) {
            const row = event.target.closest('tr');
            row.remove();
        }
    });
});


function generateData(totalRows, columns, frequency) {
    const data = [];
    let currentDate = new Date(); 
    for (let i = 1; i <= totalRows; i++) {
        const row = { ID: i, Fecha: new Date(currentDate) }; 
        columns.forEach(column => {
            if (column.columnName !== 'ID' && column.columnName !== 'Fecha') {
                let columnName = column.columnName;
                let value;
                switch (column.dataType) {
                    case 'temperature':
                        columnName = 'Temperatura (°C)';
                        value = generateNumericValue(column.minValue, column.maxValue, column.pattern, i);
                        break;
                    case 'humidity':
                        columnName = 'Humedad (%)';
                        value = generateNumericValue(column.minValue, column.maxValue, column.pattern, i);
                        break;
                    case 'pre':
                        columnName = 'Presión (hPa)';
                        value = generateNumericValue(column.minValue, column.maxValue, column.pattern, i);
                        break;
                    case  'voltage':
                        columnName = 'Voltaje (V)';
                        value = generateNumericValue(column.minValue, column.maxValue, column.pattern, i);
                        break;
                    case 'current':
                        columnName = 'Corriente (A)';
                        value = generateNumericValue(column.minValue, column.maxValue, column.pattern, i);
                        break;
                    case 'power':
                        columnName = 'Potencia (W)';
                        value = generateNumericValue(column.minValue, column.maxValue, column.pattern, i);
                        break;
                }
                row[columnName] =
                row[columnName] = value;
            }
        });
        data.push(row);
        switch (frequency) {
            case 'hora':
                currentDate.setHours(currentDate.getHours() + 1);
                break;
        }
    }
    return data;
}

function editRow(row) {
    const cells = Array.from(row.querySelectorAll('td'));
    cells.forEach(cell => {
        const oldValue = cell.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = oldValue;
        cell.textContent = '';
        cell.appendChild(input);
    });

    const actionCell = row.querySelector('.action-cell');
    actionCell.innerHTML = '<button class="save-btn">Guardar</button>';
}

// Función para guardar los cambios después de editar
dataTable.addEventListener('click', (event) => {
    if (event.target.classList.contains('save-btn')) {
        const row = event.target.closest('tr');
        saveRow(row);
    }
});

function saveRow(row) {
    const cells = Array.from(row.querySelectorAll('td'));
    cells.forEach(cell => {
        const input = cell.querySelector('input');
        const text = input.value;
        cell.textContent = text;
        const actionCell = row.querySelector('.action-cell');
        actionCell.innerHTML = '<button class="edit-btn">Editar</button> <button class="remove-btn">Eliminar</button>';

    });
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
    table.innerHTML = '';

    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    Object.keys(data[0]).forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    });

    
    const tbody = table.createTBody();
    data.forEach(rowData => {
        const dataRow = tbody.insertRow();
        Object.values(rowData).forEach(value => {
            const cell = dataRow.insertCell();
            cell.textContent = value;
        });
        const actionCell = dataRow.insertCell();
        actionCell.classList.add('action-cell');
        actionCell.innerHTML = '<button class="edit-btn">Editar</button> <button class="remove-btn">Eliminar</button>';
    });
}
function exportToCsv(data, filename) {
    const csvContent = "data:text/csv;charset=utf-8,"
        + data.map(row => Object.values(row).join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


function getDataFromTable(table) {
    const data = [];
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const rowData = {};
        const cells = row.querySelectorAll('td');
        const headers = Array.from(table.querySelectorAll('th'));
        cells.forEach((cell, index) => {
            if (headers[index]) {
                rowData[headers[index].textContent] = cell.textContent;
            }
        });
        data.push(rowData);
    });
    return data;
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
