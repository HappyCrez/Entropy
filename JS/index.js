const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 350 + window.innerWidth / 5;
canvas.height = 230;

// Graph Info
let graphXpos = canvas.width / 3;
let axisYsize = 200;

let graphTriangleSize = 10;

// Graph X axis
const graphStepAxisX = 15;
let countNumsAtX = (canvas.width - graphXpos * 2 - 5) / 20 - 1;

// Graph Y axis
const maxValueY = 600;
const minValueY = 0;
const graphStepY = 50;
const graphNumsDistance = 20;
const countNumsAtY = 9;

// Thermocouple
let thermocoupleCountNumsAtY = 12;
let thermocoupleDist = 50;
let axisWeight = 2;

const thermocoupleNumsDistance = 17;
const thermocoupleStepY = 1;

// Physic
let isPower = false;
let voltage = 12;
let amperage = 0.1;

let specificHeat = 23 * 10^3;
let massOfTin = 0.002;

const maxTemp = 370;
const meeltingTemp = 270;
const roomTemp = 24;
let bodyTemp;
let temperature;


// Graphic
let graphCoordX, graphCoordY;
let thermocoupleCoordY;

let graphic = [[graphXpos, axisYsize - roomTemp / graphStepY * graphNumsDistance]];

// Time
let timeStart;
let timePass;
let currentTime;

let animationFrame = 0;

const timerLabel = document.querySelector('.timer');
const toggleBtn = document.querySelector('#toggleBtn');
toggleBtn.addEventListener('click', ()=> {
    toggle();
}
);

function toggle() {
    if (isPower)
        turnPowerOff();
    else
        turnPowerOn();
}

function turnPowerOn() {
    isPower = true;
    toggleBtn.innerHTML = 'Выключить';
    stopLaborator();
    setup();
    startLaborator();
}

function turnPowerOff() {
    isPower = false;
    toggleBtn.innerHTML = 'Включить';
}

function startLaborator() {
    animationFrame = requestAnimationFrame(startLaborator);

    let deltaTime = currentTime - new Date().getTime();
    currentTime = new Date().getTime();
    timePass = (currentTime - timeStart) / 1000;

    temperature = calculateTemperature(timePass, deltaTime);
    
    graphCoordX =  timePass / graphStepAxisX * graphNumsDistance + graphXpos;
    graphCoordY = axisYsize - temperature / graphStepY * graphNumsDistance;
    graphic.push([graphCoordX, graphCoordY]);
    
    thermocoupleCoordY = axisYsize - (0.035 * temperature) / thermocoupleStepY * graphNumsDistance;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateTimerLabel(timePass);
    drawThermocouple(thermocoupleCoordY);
    updateGraphic();
    
    if (temperature < roomTemp) stopLaborator();
}

function calculateTemperature(timePass, deltaTime) {
    if (isPower)
    {
        // Расчет повышения температуры
        let deltaTemp = (timePass*amperage*voltage) / (specificHeat*massOfTin);
        bodyTemp = deltaTemp + roomTemp;
    }
    else
    {
        // Охлаждение
        bodyTemp -= (deltaTime / 100) / 2;
    }
    
    // Температура перегревания
    if (bodyTemp > maxTemp) {
        processOverheating();
    }

    // Температура при плавлении постоянна
    if (bodyTemp > meeltingTemp)
    {
        return meeltingTemp;
    }
    
    return bodyTemp;
}

function processOverheating() {
    bodyTemp = maxTemp;
    alert("Перегрев установки, следите за температурой");
    turnPowerOff();
}

function stopLaborator() {
    window.cancelAnimationFrame(animationFrame);
    bodyTemp = roomTemp;
}

////     Рисование термопары     ////

function drawThermocouple(coordY) {
    drawThermocoupleMarks();
    drawThermocoupleIndecator(coordY);
    drawThermocoupleOutput();
}

function drawThermocoupleOutput() {
    // first vertical line
    ctx.fillRect(thermocoupleDist, 0, axisWeight, axisYsize);
    // second vertical line
    ctx.fillRect(thermocoupleDist * 2, 0, axisWeight, axisYsize);

    // up horizontal lines
    ctx.fillRect(thermocoupleDist / 2, 0, thermocoupleDist / 2, axisWeight);
    ctx.fillRect(thermocoupleDist * 2, 0, thermocoupleDist / 2, axisWeight);
    
    // down horizontal lines
    ctx.fillRect(thermocoupleDist / 2, axisYsize, thermocoupleDist / 2, axisWeight);
    ctx.fillRect(thermocoupleDist * 2, axisYsize, thermocoupleDist / 2, axisWeight);
}

function drawThermocoupleMarks() {
    for (let i = 1; i < thermocoupleCountNumsAtY; i++) {
        ctx.fillStyle = "black";
        ctx.fillText((i * thermocoupleStepY) + "", thermocoupleDist * 1.5, axisYsize - i * thermocoupleNumsDistance);

        ctx.fillStyle = "gray";
        ctx.fillRect(thermocoupleDist + thermocoupleDist / 4, axisYsize - i * thermocoupleNumsDistance + 5, thermocoupleDist / 2, 1);
    }
    ctx.fillRect(thermocoupleDist + thermocoupleDist / 4, axisYsize - thermocoupleCountNumsAtY * thermocoupleNumsDistance + 5, thermocoupleDist / 2, 1);
    ctx.fillStyle = "black";
}

function drawThermocoupleIndecator(coordY) {
    ctx.fillStyle = "red";
    ctx.fillRect(thermocoupleDist, coordY, thermocoupleDist, axisWeight);
    ctx.fillStyle = "black";
}

////    Рисование графика    ////

function updateGraphic() {
    drawGraphAxices();
    drawGraphLine();
}

function drawGraphLine() {
    ctx.beginPath();
    ctx.moveTo(graphic[0][0], graphic[0][1]);
    graphic.forEach((point) => {
        ctx.lineTo(point[0], point[1]);
    });
    ctx.stroke();
    ctx.closePath();
}

function drawGraphAxices() {
    let timePass = 0;

    ctx.beginPath();    
    // Y
    ctx.moveTo(graphXpos, axisYsize);
    ctx.lineTo(graphXpos, 0);
    // Triangle
    ctx.lineTo(graphXpos - graphTriangleSize / 2, graphTriangleSize);
    ctx.lineTo(graphXpos + graphTriangleSize / 2, graphTriangleSize);
    ctx.lineTo(graphXpos, 0);
    
    // X
    ctx.moveTo(graphXpos, axisYsize);
    ctx.lineTo(canvas.width, axisYsize);
    // Triangle
    ctx.lineTo(canvas.width - graphTriangleSize, axisYsize - graphTriangleSize / 2);
    ctx.lineTo(canvas.width - graphTriangleSize, axisYsize + graphTriangleSize / 2);
    ctx.lineTo(canvas.width, axisYsize);
    ctx.fill();
    
    ctx.fillText('C⁰', graphXpos - 20, 9);
    ctx.fillText('t', canvas.width - graphTriangleSize, axisYsize + 15);
    ctx.stroke();
    
    ctx.closePath();
}

function setTextStyle() {
    ctx.textAlign = "center";
    ctx.font = "regular 14px Courier New";
}

function updateTimerLabel(timePass) {
    timePass = Math.round(timePass * 100) / 100;
    timerLabel.innerHTML = timePass + ' c';
}

function setup() {
    timeStart = new Date();
    currentTime = timeStart;
    graphic = [[graphXpos, axisYsize]];
    setTextStyle();
    updateGraphic();
    drawThermocouple();
    updateTimerLabel(0);
}
setup();