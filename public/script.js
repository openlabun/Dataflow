document.addEventListener('DOMContentLoaded', function () {
  const dataConfigForm = document.getElementById('dataConfigForm');
  const columnsContainer = document.getElementById('columnsContainer');
  const addColumnBtn = document.getElementById('addColumnBtn');
  const dataTable = document.getElementById('dataTable');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const csvFileInput = document.getElementById('csvFileInput');
  const loadDataButton = document.getElementById('loadDataButton');
  const myChartCanvas = document.getElementById('myChart').getContext('2d');
  const pairPlotContainer = document.getElementById('pairPlot');

  let generatedData = [];
  let chartInstance = null; // Variable to hold the chart instance
  let filterContainer = null; // Variable to hold the filter container

  // Agregar columna
  addColumnBtn.addEventListener('click', () => {
    const columnConfig = document.createElement('div');
    columnConfig.className = 'columnConfig';
    columnConfig.innerHTML = `
      <label for="columnName">Nombre de la columna:</label>
      <input type="text" name="columnName" required />
      <br />
      <label for="dataType">Tipo de dato:</label>
      <select name="dataType" required>
        <option value="temperature">Temperatura (°C)</option>
        <option value="humidity">Humedad (%)</option>
        <option value="pressure">Presión (hPa)</option>
        <option value="power">Potencia (W)</option>
        <option value="current">Corriente (A)</option>
        <option value="voltage">Voltaje (V)</option>
      </select>
      <br />
      <div class="numericConfig">
        <label for="minValue">Valor mínimo:</label>
        <input type="number" name="minValue" />
        <br />
        <label for="maxValue">Valor máximo:</label>
        <input type="number" name="maxValue" />
        <br />
      </div>
      <label for="variationPattern">Patrón de variación:</label>
      <select name="variationPattern" required>
        <option value="constant">Constante</option>
        <option value="linear">Lineal</option>
        <option value="sinusoidal">Senoidal</option>
        <option value="random">Aleatorio</option>
      </select>
      <br />
      <button type="button" class="removeColumnBtn">Eliminar Columna</button>
    `;
    columnsContainer.appendChild(columnConfig);

    columnConfig.querySelector('.removeColumnBtn').addEventListener('click', () => {
      columnsContainer.removeChild(columnConfig);
    });
  });

  // Generar datos
  dataConfigForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(dataConfigForm);
    const totalRows = parseInt(formData.get('totalRows'));
    const dataFrequency = formData.get('dataFrequency');
    const startDate = new Date(formData.get('startDate'));

    const columns = [];
    columnsContainer.querySelectorAll('.columnConfig').forEach((columnConfig) => {
      const columnName = columnConfig.querySelector('[name="columnName"]').value;
      const dataType = columnConfig.querySelector('[name="dataType"]').value;
      const minValue = parseFloat(columnConfig.querySelector('[name="minValue"]').value);
      const maxValue = parseFloat(columnConfig.querySelector('[name="maxValue"]').value);
      const variationPattern = columnConfig.querySelector('[name="variationPattern"]').value;
      columns.push({ columnName, dataType, minValue, maxValue, variationPattern });
    });

    generatedData = generateData(totalRows, columns, startDate, dataFrequency);
    displayData(generatedData);
    exportCsvBtn.disabled = false;
    createChart(generatedData);
    createPairPlot(generatedData);
  });

  // Generar datos sintéticos
  function generateData(totalRows, columns, startDate, dataFrequency) {
    const data = [];
    const timeStep = getTimeStep(dataFrequency);

    for (let i = 0; i < totalRows; i++) {
      const row = { id: i + 1, date: new Date(startDate.getTime() + i * timeStep).toISOString() };
      columns.forEach((column) => {
        const { columnName, dataType, minValue, maxValue, variationPattern } = column;
        row[columnName] = generateValue(dataType, minValue, maxValue, variationPattern, i, totalRows);
      });
      data.push(row);
    }

    return data;
  }

  function getTimeStep(dataFrequency) {
    switch (dataFrequency) {
      case 'seconds':
        return 1000; // 1 second in milliseconds
      case 'minutes':
        return 60000; // 1 minute in milliseconds
      case 'hours':
        return 3600000; // 1 hour in milliseconds
      default:
        return 1000; // Default to 1 second
    }
  }

  function generateValue(dataType, minValue, maxValue, variationPattern, index, totalRows) {
    switch (variationPattern) {
      case 'constant':
        return minValue;
      case 'linear':
        return minValue + ((maxValue - minValue) / (totalRows - 1)) * index;
      case 'sinusoidal':
        const amplitude = (maxValue - minValue) / 2;
        const offset = minValue + amplitude;
        return offset + amplitude * Math.sin((2 * Math.PI * index) / totalRows);
      case 'random':
        return Math.random() * (maxValue - minValue) + minValue;
      default:
        return minValue;
    }
  }

  // Mostrar datos en la tabla
  function displayData(data) {
    const headers = Object.keys(data[0]);
    dataTable.innerHTML = `
      <thead>
        <tr>
          ${headers.map(header => `<th>${header}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${data.map((row, rowIndex) => `
          <tr>
            ${headers.map(header => `
              <td contenteditable="${header !== 'id' && header !== 'date'}" data-row="${rowIndex}" data-column="${header}">
                ${row[header]}
              </td>
            `).join('')}
          </tr>
        `).join('')}
      </tbody>
    `;

    dataTable.querySelectorAll('td[contenteditable="true"]').forEach(cell => {
      cell.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          cell.blur();
        }
      });
      cell.addEventListener('input', () => {
        const rowIndex = parseInt(cell.getAttribute('data-row'));
        const columnName = cell.getAttribute('data-column');
        generatedData[rowIndex][columnName] = cell.textContent;
      });
    });

    addFilterControls(headers);
  }

  // Añadir controles de filtro
  function addFilterControls(headers) {
    if (filterContainer) {
      // Si el filtro ya existe, no añadir uno nuevo
      return;
    }

    filterContainer = document.createElement('div');
    filterContainer.innerHTML = `
      <label for="filterColumn">Filtrar por:</label>
      <select id="filterColumn">
        ${headers.filter(header => header !== 'id' && header !== 'date').map(header => `<option value="${header}">${header}</option>`).join('')}
      </select>
      <label for="filterCondition">Condición:</label>
      <select id="filterCondition">
        <option value="equal">Igual a</option>
        <option value="greater">Mayor que</option>
        <option value="less">Menor que</option>
      </select>
      <input type="text" id="filterValue" placeholder="Valor" />
      <button id="applyFilterBtn">Aplicar Filtro</button>
    `;
    dataTable.parentNode.insertBefore(filterContainer, dataTable);

    document.getElementById('applyFilterBtn').addEventListener('click', () => {
      const column = document.getElementById('filterColumn').value;
      const condition = document.getElementById('filterCondition').value;
      const value = document.getElementById('filterValue').value;
      const filteredData = applyFilter(generatedData, column, condition, value);
      displayData(filteredData);
    });
  }

  function applyFilter(data, column, condition, value) {
    switch (condition) {
      case 'equal':
        return data.filter(row => row[column] == value);
      case 'greater':
        return data.filter(row => parseFloat(row[column]) > parseFloat(value));
      case 'less':
        return data.filter(row => parseFloat(row[column]) < parseFloat(value));
      default:
        return data;
    }
  }

  // Exportar a CSV
  exportCsvBtn.addEventListener('click', () => {
    const csvContent = generateCSV(generatedData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  function generateCSV(data) {
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(header => row[header]).join(','));
    return [headers.join(','), ...rows].join('\n');
  }

  // Cargar CSV
  loadDataButton.addEventListener('click', () => {
    const file = csvFileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvData = event.target.result;
        const parsedData = parseCSV(csvData);
        generatedData = parsedData;
        displayData(parsedData);
        createChart(parsedData);
        createPairPlot(parsedData);
      };
      reader.readAsText(file);
    }
  });

  function parseCSV(csvData) {
    const [headerLine, ...rows] = csvData.split('\n');
    const headers = headerLine.split(',');
    return rows.map(row => {
      const values = row.split(',');
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index];
      });
      return rowData;
    });
  }

  // Gráfica de datos con Chart.js
  let chart;
  function createChart(data) {
    const labels = data.map(row => row.date);
    const datasets = Object.keys(data[0]).filter(key => key !== 'date' && key !== 'id').map((key, index) => ({
      label: key,
      data: data.map(row => row[key]),
      borderColor: `hsl(${index * 60}, 70%, 50%)`,
      fill: false
    }));

    if (chart) {
      chart.destroy();
    }

    chart = new Chart(myChartCanvas, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        plugins: {
          zoom: {
            pan: {
              enabled: true,
              mode: 'xy'
            },
            zoom: {
              enabled: true,
              mode: 'xy'
            }
          }
        }
      }
    });
  }

  // Gráfica de pares con Plotly.js
  function createPairPlot(data) {
    const dimensions = Object.keys(data[0]).filter(key => key !== 'id' && key !== 'date').map(key => ({
      label: key,
      values: data.map(row => row[key])
    }));

    const trace = {
      type: 'splom',
      dimensions,
      marker: {
        color: 'rgba(31, 119, 180, 0.7)',
        size: 5,
        line: {
          color: 'white',
          width: 0.5
        }
      }
    };

    const layout = {
      title: 'Pair Plot',
      height: 800,
      width: 800
    };

    Plotly.react(pairPlotContainer, [trace], layout);
  }

  // Evento para regenerar gráficas cuando los datos cambien
  dataConfigForm.addEventListener('submit', () => {
    createChart(generatedData);
    createPairPlot(generatedData);
  });

  csvFileInput.addEventListener('change', () => {
    createChart(generatedData);
    createPairPlot(generatedData);
  });
});
