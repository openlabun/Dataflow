document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('dataConfigForm');
    const columnsContainer = document.getElementById('columnsContainer');
    const addColumnBtn = document.getElementById('addColumnBtn');
    const dataTable = document.getElementById('dataTable');
    const exportCsvBtn = document.getElementById('exportCsvBtn');

    addColumnBtn.addEventListener('click', () => {
        const columnConfig = createColumnConfig();
        columnsContainer.appendChild(columnConfig);
        columnConfig.querySelector('.removeColumnBtn').addEventListener('click', () => {
            columnsContainer.removeChild(columnConfig);
        });
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const totalRows = document.getElementById('totalRows').value;
        const frequency = document.getElementById('dataFrequency').value;
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

    dataTable.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-row')) {
            const row = event.target.closest('tr');
            row.remove();
        }
    });
});

function createColumnConfig() {
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
    return columnConfig;
}

function generateData(totalRows, columns, frequency) {
    const data = [];
    let currentDate = new Date();
    for (let i = 1; i <= totalRows; i++) {
        const row = { ID: i, Fecha: new Date(currentDate) };
        columns.forEach(column => {
            if (column.columnName !== 'ID' && column.columnName !== 'Fecha') {
                let value;
                switch (column.dataType) {
                    case 'temperature':
                    case 'humidity':
                        value = generateNumericValue(column.minValue, column.maxValue, column.pattern, i);
                        break;
                    case 'date':
                        value = new Date(currentDate);
                        break;
                }
                row[column.columnName] = value;
            }
        });
        data.push(row);
        switch (frequency) {
            case 'seconds':
                currentDate.setSeconds(currentDate.getSeconds() + 1);
                break;
            case 'minutes':
                currentDate.setMinutes(currentDate.getMinutes() + 1);
                break;
            case 'hours':
                currentDate.setHours(currentDate.getHours() + 1);
                break;
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

function displayDataInTable(data, table) {
    table.innerHTML = '';

    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    Object.keys(data[0]).forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    });
    const deleteHeader = document.createElement('th');
    deleteHeader.textContent = 'Acciones';
    headerRow.appendChild(deleteHeader);

    const tbody = table.createTBody();
    data.forEach(row => {
        const dataRow = tbody.insertRow();
        Object.values(row).forEach(value => {
            const cell = dataRow.insertCell();
            cell.textContent = value;
        });
        const deleteCell = dataRow.insertCell();
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.classList.add('delete-row');
        deleteCell.appendChild(deleteButton);
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
    await fetch('/api/sensors/data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}
