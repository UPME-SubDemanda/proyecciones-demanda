# Modelo de demanda de energía eléctrica

Cómo se proyecta la demanda de energía eléctrica en cada revisión publicada, según su informe (PFU-03). Una sección por revisión; las que todavía no tienen informe están en X-32.

## Rev. Julio 2026 (`2026-07`)

**Informe:** *Proyección de la demanda de energía eléctrica y potencia máxima 2026-2040, Rev. Julio 2026*, Subdirección de Demanda (archivo `Proyecciones_demanda_Energia_Electrica_y_Potencia_Maxima_Rev_Julio_2026_VRF.pdf`; enlace en X-31). Las páginas son las impresas en el informe; en el PDF son una más (la página 43 del informe es la 44 del PDF).

### Qué se proyecta

La proyección tiene cuatro componentes (p. 42, numeral 4.1):

1. el consumo del Sistema Interconectado Nacional (SIN), que es lo que proyecta el modelo econométrico;
2. los grandes consumidores especiales (GCE) que anunciaron a la UPME que se van a conectar;
3. el consumo de los vehículos eléctricos, tomado de las proyecciones del Plan Energético Nacional 2025-2055;
4. la reducción de demanda por la generación distribuida (GD).

En la base, cada componente es un `core.components` y las series que los suman están en `core.series_composition`.

### Método

- **Combinación de pronósticos** (p. 43, nota 36): la proyección del SIN combina varios modelos, como si cada uno fuera el pronóstico de un experto distinto. El informe dice que la combinación da proyecciones más precisas que cada modelo por separado.
- **Modelos combinados y pesos** (p. 43, notas 36 a 38): VAR endógeno 22 %, VAR exógeno 56 % y VEC 22 %. Son los pesos que resultaron del ejercicio de 2023. VAR es un modelo de vectores autorregresivos y VEC, uno de vectores de corrección de error.
- **Variables dummy del VEC** (p. 43, nota 38): al VEC se le agregan variables exógenas «Dummy» de tipo impulso o escalón. Una dummy vale 1 en los periodos marcados y 0 en los demás; le dice al modelo que en esos periodos pasó algo que las demás variables no explican. Un impulso es un choque que dura solo ese periodo; un escalón, un cambio de nivel que se mantiene. Periodos:
    - Q2/2010 a Q1/2011
    - Q1/2013 a Q4/2013
    - Q3/2017 a Q2/2018
    - Q2/2020 a Q1/2021
    - Q2/2023 a Q1/2024
    - Q2/2026 a Q1/2027 (dentro del horizonte proyectado)

    El informe no dice qué representa cada periodo ni cuál es de impulso y cuál de escalón. Ni por qué se marca un periodo futuro.
- **Intervalos de confianza** (p. 43): la proyección del valor esperado lleva dos intervalos de confianza (68 % y 95 %, p. 44), «en el mismo rango sobre todo el periodo de proyección».

### Variables explicativas

Tabla 10 del informe (p. 42 y 43):

| Variable | Periodo | Unidad | Fuente |
| --- | --- | --- | --- |
| Demanda histórica de energía eléctrica del SIN | Mensual, 1994M01 a 2026M01 | GWh-mes | XM, Sinergox, Históricos – Demanda_Energia_SIN (p. 42, nota 31) |
| PIB real | Histórico trimestral 1994Q1 a 2026Q1; proyección trimestral 2026Q2 a 2040Q4 | Miles de millones de pesos constantes, base 2015 | DANE (nota 32); proyección UPME-Fedesarrollo (nota 33) |
| Población | Histórico anual 1994 a 2017; proyección anual 2018 a 2040 | Habitantes | DANE (p. 43, nota 34) |
| Temperatura media de las áreas del SIN | Histórico mensual 1994M01 a 2026M03; proyección mensual 2026M04 a 2040M12 | °C | IDEAM (p. 43, nota 35) |

- **Correlaciones con la demanda del SIN** (p. 43, Gráfica 20): PIB real 67,8 %, temperatura media 56,5 % y población −15,1 %.
- **Datos de XM** consultados el 14 de abril de 2026 (p. 43, fuente de la Gráfica 20).
- **Corte del dato real:** valores definitivos con corte a marzo de 2026 (p. 26, nota 19 de la Gráfica 13). No coincide con el periodo de la Tabla 10 (1994M01 a 2026M01): es la observación E-7 de X-23.

### Supuestos

- **Crecimiento del PIB** (p. 44): el supuesto principal es el crecimiento potencial de la economía. Es 2,5 % en 2026 y 2,8 % en 2027, según el estudio de Fedesarrollo para la UPME (nota 39). Para 2028 a 2040 es alrededor de 2,8 %, en línea con el Banco de la República, el Banco Mundial, el FMI y el Marco Fiscal de Mediano Plazo 2025 (notas 40 a 43).
- **GCE:** la lista de proyectos fue actualizada y reportada por las empresas y los operadores de red con corte al 8 de abril de 2026 (p. 49, nota de la tabla de GCE).
- **Generación distribuida** (p. 52):
    - la información es la que reportan los operadores de red, según la Resolución CREG 174 de 2021;
    - la generación eólica y solar se proyecta con la metodología de Staffell y Pfenninger (nota 56), con datos reportados y series de variables climáticas, manteniendo constantes la capacidad instalada, la ubicación y la antigüedad;
    - la capacidad reportada para 2024 es de 422,90 MW, con reporte del 8 de abril de 2026 (nota 54).

### Dudas abiertas

Están en las observaciones al equipo de modelación (X-23):

- E-7: el periodo de la demanda histórica en la Tabla 10;
- Q-3: cómo se calculan los meses reales del primer año del anual;
- Q-5: si los intervalos recogen la incertidumbre de GCE, movilidad eléctrica y GD.

## Revisiones anteriores

2023-12, 2024-07, 2024-12 y 2025-07: por documentar cuando se tengan sus informes (X-32). En la base su modelo dice «por confirmar».
