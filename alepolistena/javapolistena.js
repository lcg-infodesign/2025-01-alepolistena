// =========================================================
// VARIABILI GLOBALI
// =========================================================
let dataTable;          // Oggetto p5.Table per il dataset
let rulesStrings;       // Array di stringhe per le regole (non usate direttamente, ma lette per completezza)
let validRows = [];     // Array che conterrà solo le righe filtrate
let statistics = {};    // Oggetto per memorizzare i risultati dei calcoli

// =========================================================
// 1. CARICAMENTO DEI DATI (PRELOAD)
// =========================================================
function preload() {
  // Carica il dataset (CSV con riga di intestazione)
  dataTable = loadTable('dataset.csv', 'csv', 'header'); 
  
  // Carica il file delle regole (non strettamente necessario in questo caso, ma richiesto)
  rulesStrings = loadStrings('rules.txt');
  
  console.log("Dati caricati. Righe totali:", dataTable.getRowCount());
}

// =========================================================
// 2. ELABORAZIONE E CALCOLO DATI (SETUP)
// =========================================================
function setup() {
  createCanvas(800, 600);
  background(240); 
  noLoop(); 
  
  // 2a. Trova le righe valide
  filterValidRows();
  
  // 2b. Calcola tutte le statistiche richieste
  calculateAllStatistics();
}

/**
 * 2a. Implementa le regole di filtro: 
 * column4 multiplo di 7 AND column3 multiplo di 3.
 */
function filterValidRows() {
  let numRows = dataTable.getRowCount();
  
  for (let i = 0; i < numRows; i++) {
    let row = dataTable.getRow(i);
    
    // Estrai i valori delle colonne richieste per il filtro
    let valCol3 = row.getNum('column3'); 
    let valCol4 = row.getNum('column4'); 
    
    // Le righe nel tuo CSV sono numeri interi, quindi usiamo l'operatore modulo (%)
    
    // Regola 1: column4 è multiplo di 7
    let rule1 = (valCol4 % 7 === 0);
    
    // Regola 2: column3 è multiplo di 3
    let rule2 = (valCol3 % 3 === 0);
    
    // Una riga è valida se ENTRAMBE le regole sono soddisfatte (logica AND)
    if (rule1 && rule2) { 
      validRows.push(row);
    }
  }
  
  console.log(`Numero di righe valide filtrate: ${validRows.length}`);
}

/**
 * 2b. Calcola le statistiche richieste sulle righe filtrate.
 */
function calculateAllStatistics() {
  if (validRows.length === 0) {
    console.error("Nessuna riga valida trovata. Le statistiche saranno 0.");
    return;
  }
  
  // Estrai gli array di dati per ogni colonna richiesta dall'esercizio:
  let col1 = validRows.map(row => row.getNum('column1')); // Media Col1
  let col2 = validRows.map(row => row.getNum('column2')); // Dev. Std. Col2
  let col3 = validRows.map(row => row.getNum('column3')); // Moda Col3
  let col4 = validRows.map(row => row.getNum('column4')); // Mediana Col4
  let col5 = validRows.map(row => row.getNum('column0')); // Media & Dev. Std. Col5 (Col0)
  
  // Calcola e memorizza i risultati
  statistics.meanCol1 = calculateMean(col1);
  statistics.stdDevCol2 = calculateStandardDeviation(col2);
  statistics.modeCol3 = calculateMode(col3);
  statistics.medianCol4 = calculateMedian(col4);
  statistics.medianCol5 = calculateMedian(col5);
  statistics.stdDevCol5 = calculateStandardDeviation(col5);
  
  // L'esercizio chiede 'Mean and standard deviation of the fifth column'. 
  // Assumendo che la 'quinta colonna' (column5 in un indice 1-based) sia 'column0' 
  // (perché il tuo CSV ha solo 5 colonne totali: 0, 1, 2, 3, 4).
  statistics.meanCol0 = calculateMean(col5); 
  statistics.stdDevCol0 = calculateStandardDeviation(col5);
  
  console.log("Statistiche calcolate:", statistics);
}

// === FUNZIONI DI CALCOLO MATEMATICO ===
function calculateMean(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function calculateStandardDeviation(arr) {
  if (arr.length <= 1) return 0;
  const mean = calculateMean(arr);
  const squaredDifferences = arr.map(val => (val - mean) ** 2);
  const avgSquaredDiff = calculateMean(squaredDifferences);
  return Math.sqrt(avgSquaredDiff);
}

function calculateMode(arr) {
  if (arr.length === 0) return "N/A";
  const counts = {};
  arr.forEach(val => counts[val] = (counts[val] || 0) + 1);
  let maxCount = 0;
  let mode = [];
  for (const val in counts) {
    if (counts[val] > maxCount) {
      maxCount = counts[val];
      mode = [parseFloat(val)];
    } else if (counts[val] === maxCount) {
      mode.push(parseFloat(val));
    }
  }
  return mode.join(', '); 
}

function calculateMedian(arr) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  } else {
    return sorted[middle];
  }
}

// =========================================================
// 3. VISUALIZZAZIONE DATI (DRAW)
// =========================================================
function draw() {
  if (validRows.length === 0) {
    fill(0); textSize(20);
    text("Nessun dato valido trovato. Controlla le regole.", 50, height/2);
    return;
  }
  
  // --- VISUALIZZAZIONI TESTUALI ---
  textSize(13);
  textAlign(LEFT, TOP);
  fill(0);
  let startY = 30;
  let lineH = 30;
  
  // Testuale 1: 
  text(`1. Media (column1): ${nf(statistics.meanCol1, 0, 2)}`, 20, startY);

  // Testuale 2 tabella moda col3
  drawStatisticsTableInCanvas(250, 30, 380, statistics);

  // Grafico a Barre Mediana Col4
  drawBarChart(30, 200, 200, 150, statistics.meanCol1, statistics.medianCol4);

  // Grafico Deviazione Standard Col2
  drawDeviationVisual(400, 295, 50, statistics.stdDevCol2);
  
  // Grafico a candela per Media e Dev. Std. della col5
  drawCandlestickDeviation(650, 180, 150, statistics.meanCol0, statistics.stdDevCol0);
}

// FUNZIONI DI DISEGNO

function drawBarChart(x, y, w, h, val1, val2) {
  push();
  translate(x, y);
  
  let maxVal = Math.max(Math.abs(val1), Math.abs(val2)) * 1.2; 
  let zeroLine = map(0, -maxVal, maxVal, h, 0); // Linea dello zero al centro del grafico

 

  // Barra Mediana Col4
  let barH2 = map(val2, -maxVal, maxVal, 0, h);
  fill(255, 100, 100); 
  rect(w * 1/3, zeroLine, w/2, -(barH2 - zeroLine));
  text("Mediana Col4", w * 3/6, h + 5);
  
  // Linea di base e etichette
  stroke(0); line(0, zeroLine, w, zeroLine);
  
  // Linee di riferimento 
  stroke(150);
  line(0, 0, w, 0); // Max
  line(0, h, w, h); // Min
  noStroke(); fill(0);
  text(nf(maxVal, 0, 1), -10, 0);
  text(nf(-maxVal, 0, 1), -10, h);

  pop();
}

/*Fisicamente, il centro del cerchio è l'origine della nostra distribuzione visiva.
L'area scura simboleggia un'area di bassa dispersione o la massa di dati vicina alla media.
è fisso perché se il cerchio interno cambiasse dimensione,
l'osservatore perderebbe immediatamente il punto di riferimento. 
Fissandolo, l'osservatore sa che qualsiasi variazione visiva (l'anello arancione) è aggiuntiva rispetto a quella base.*/
function drawDeviationVisual(x, y, baseRadius, stdDev) {
  push();
  
  let devRadius = map(stdDev, 0, 50, 0, baseRadius * 1.5); 

  // Cerchio interno 
  fill(100, 100, 200);
  ellipse(x, y, baseRadius * 2, baseRadius * 2);
  
  // Area della Dev Standard
  fill(255, 200, 0, 150); 
  ellipse(x, y, (baseRadius + devRadius) * 2, (baseRadius + devRadius) * 2);
  
  fill(0); textSize(14); textAlign(CENTER);
  text(`Dev. Std. (Col2)`, x, y - baseRadius - 50);
  text(nf(stdDev, 0, 2), x, y + baseRadius + 30);
  
  pop();
}


// =========================================================
// FUNZIONE AGGIUNTA PER LA TABELLA NEL CANVAS
// =========================================================

/**
 * Disegna una tabella di riepilogo nel p5.js canvas.
 * Questa è la terza rappresentazione testuale di tipo diverso.
 */
function drawStatisticsTableInCanvas(x, y, tableWidth, stats) {
    push();
    translate(x, y);
    
    let rowHeight = 25;
    let col1Width = 120;
    let col2Width = 80;
    let col3Width = tableWidth - col1Width - col2Width;
    let headerHeight = 30;
    
    // Dati da visualizzare
    let data = [
        
        ["Moda", "Col3", stats.modeCol3],
    
    ];
    
    // --- Intestazione ---
    fill(50, 100, 150); // Blu scuro per l'intestazione
    rect(0, 0, tableWidth, headerHeight);

    fill(255); textSize(14); textAlign(CENTER, CENTER);
    text("Statistica", col1Width / 2, headerHeight / 2);
    text("Colonna", col1Width + col2Width / 2, headerHeight / 2);
    text("Valore", col1Width + col2Width + col3Width / 2, headerHeight / 2);
    
    let currentY = headerHeight;
    
    // --- Righe dei Dati ---
    textSize(10);
    for (let i = 0; i < data.length; i++) {
        let isEven = i % 2 === 0;
        
        // Sfondo riga alternato
        fill(isEven ? 230 : 255); 
        rect(0, currentY, tableWidth, rowHeight);
        
        fill(0); // Colore testo

        // Colonna 1: Statistica
        textAlign(LEFT, CENTER);
        text(data[i][0], 5, currentY + rowHeight / 2);
        
        // Colonna 2: Colonna di riferimento
        textAlign(CENTER, CENTER);
        text(data[i][1], col1Width + col2Width / 2, currentY + rowHeight / 2);
        
        // Colonna 3: Valore (allineato a destra)
        textAlign(RIGHT, CENTER);
        text(data[i][2], tableWidth - 5, currentY + rowHeight / 2);

        // Disegna le linee di separazione
        stroke(150);
        line(col1Width, currentY, col1Width, currentY + rowHeight);
        line(col1Width + col2Width, currentY, col1Width + col2Width, currentY + rowHeight);
        
        currentY += rowHeight;
    }
    
    // Disegna il bordo esterno
    noFill(); stroke(0); strokeWeight(1);
    rect(0, 0, tableWidth, currentY);

    pop();
}

/*
Rappresentazione a Candela per Media e Dev. Std. col5
*/
function drawCandlestickDeviation(x, y, h, mean, stdDev) {
    push();
    translate(x, y);

    let scaleFactor = 3; // Fattore di scala per i valori 
    let totalHeight = h;
    
    // Mappa la media e la deviazione standard sul grafico.
    let mappedMean = mean * scaleFactor;
    let mappedStdDev = stdDev * scaleFactor; 

    // Calcola i punti estremi della dev std
    let topPoint = totalHeight / 2 - (mappedMean + mappedStdDev);
    let bottomPoint = totalHeight / 2 - (mappedMean - mappedStdDev); 
    
    [topPoint, bottomPoint] = [Math.min(topPoint, bottomPoint), Math.max(topPoint, bottomPoint)];
    
    // rappresentazione grafica
    
    // Linea dello Zero 
    stroke(150); line(0, totalHeight / 2, 20, totalHeight / 2);

    // Linea Verticale 
    stroke(50, 50, 200); 
    strokeWeight(2);
    line(10, topPoint, 10, bottomPoint);
    
    // larghezza asta della Media
    let bodyWidth = 20;
    
    // posizione della Media sul grafico
    let meanPosition = totalHeight / 2 - mappedMean; 
    
    // Correlazione Media: Linea orizzontale più spessa
    stroke(200, 50, 50); 
    strokeWeight(4);
    line(10 - bodyWidth / 2, meanPosition, 10 + bodyWidth / 2, meanPosition);
    
    // testi
    noStroke(); fill(0); textSize(14); 
    textAlign(CENTER, TOP);
    text("Media & Dev. Std. Col5", 10, -65);
    textAlign(LEFT, CENTER);
    text(`M: ${nf(mean, 0, 2)}`, bodyWidth + 5, meanPosition);
    text(`+σ`, bodyWidth + 5, topPoint);
    text(`-σ`, bodyWidth + 5, bottomPoint);

    pop();
}