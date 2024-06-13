# DataFlow

DataFlow es una aplicación web diseñada para generar datos sintéticos de sensores. La herramienta permite a los usuarios crear datasets personalizados de manera rápida y eficiente, emulando datos de diversos sensores como temperatura, humedad, presión, potencia, corriente y voltaje. Los datos generados pueden seguir diferentes patrones de variación, como constante, lineal, senoidal y aleatorio.

## Justificación de la Herramienta

### Testing y Simulación

Los desarrolladores y científicos de datos a menudo necesitan grandes volúmenes de datos para probar y validar algoritmos, modelos de machine learning y sistemas de software. La generación de datos sintéticos proporciona una solución rápida y económica en comparación con la recolección de datos del mundo real.

### Flexibilidad y Personalización

DataFlow permite a los usuarios personalizar completamente sus datasets, especificando el número de filas, la frecuencia de generación de datos y los parámetros específicos para cada tipo de dato. Esto es crucial para crear escenarios de prueba realistas y adaptados a diferentes necesidades.

### Educación y Formación

En un contexto educativo, DataFlow es una herramienta valiosa para enseñar y demostrar conceptos de análisis de datos, machine learning y desarrollo de software, proporcionando datasets personalizables para prácticas y proyectos.

## Propuesta de nuevas funcionalidades

1. **Integración con API Externas para Datos Reales:** Agregar la capacidad de integrar datos reales de sensores mediante APIs externas, permitiendo la combinación de datos sintéticos y reales para enriquecer los datasets.
2. **Correlación:** Incorporar opciones para correlacionar varias varaibles, ya sea directa o inversamente. De esa manera, los datos cobrarán aún más sentido.

## Ejecución

1. Abre tu CMD.
2. Navega hasta el directorio del proyecto.
3. Ejecuta 
```
node server.js
```
4. El proyecto se ejecutará en el puerto 3000 `http://localhost:3000`.

## Ejecución con Docker
Asegúrate de tener Docker instalado y ejecutando en tu sistema.

```
docker-compose up --build
```

- Si la imagen ya esta construida solo ejecuta:
```
docker-compose up
```
- Si deseas ejecutar los contenedores en segundo plano:
```
docker-compose up -d
```

Accede a la aplicación a través de `http://localhost:3000` en tu navegador.

Video de prueba: https://drive.google.com/file/d/1DVNsqbiaO0b4pcQYphhQwULf8BD3227q/view?usp=sharing 

## Miembros del equipo

- Yuli Meza (Github: yulimezab) NRC 2381
- Daniel Mendoza (Github: DEM2) NRC 2381
