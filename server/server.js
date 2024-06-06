const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');


const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Endpoints para la API REST (NO IMPLEMENTADO)

app.get('/api/sensors/data', async (req, res) => {
    try {
        const data = await SensorData.findAll();
        res.json(data);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post('/api/sensors/data', async (req, res) => {
    try {
        const { columnName, dataType, value, pattern } = req.body;
        const newData = await SensorData.create({ columnName, dataType, value, pattern });
        res.status(201).json(newData);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.put('/api/sensors/data/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { columnName, dataType, value, pattern } = req.body;
        const data = await SensorData.findByPk(id);
        if (data) {
            data.columnName = columnName;
            data.dataType = dataType;
            data.value = value;
            data.pattern = pattern;
            await data.save();
            res.json(data);
        } else {
            res.status(404).send('Data not found');
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

app.delete('/api/sensors/data/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await SensorData.findByPk(id);
        if (data) {
            await data.destroy();
            res.status(204).send();
        } else {
            res.status(404).send('Data not found');
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
