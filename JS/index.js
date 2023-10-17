const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 350 + window.innerWidth / 10;
canvas.height = 230;

// Graph X axis
let graphStepAxisX = 15;

if (window.innerWidth < 500) {
    canvas.width = 350;
    graphStepAxisX = 30;
}

// Graph Info
let graphXpos = canvas.width / 3 + 40;
let axisYsize = 200;
let countNumsAtX = (canvas.width - graphXpos * 2 - 5) / 20 - 1;

let graphTriangleSize = 10;

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

// Graphic
let graphCoordX, graphCoordY;
let thermocoupleCoordY;

let graphic = [[graphXpos, axisYsize - roomTemp / graphStepY * graphNumsDistance]];

// Time
let timeStart;
let timePass;
let currentTime;

let animationFrame = 0;
let isInstructionOpen = false;

const meeltingAlert = document.querySelector('#meeltingAlert');
const overheatingAlert = document.querySelector('#overheatingAlert');
const timerLabel = document.querySelector('.timer');

const mainBlock = document.querySelector('.mainBlock');
const instructionBlock = document.querySelector('.instructionBlock');

const instructBtn = document.querySelector('#instructBtn');
instructBtn.addEventListener('click', () => {
    if (isInstructionOpen)
        instructionClose();
    else
        instructionOpen();
});

function instructionClose() {
    isInstructionOpen = false;
    mainBlock.classList.remove('visually-hidden');
    instructionBlock.classList.add('visually-hidden');
}

function instructionOpen () {
    isInstructionOpen = true;
    mainBlock.classList.add('visually-hidden');
    instructionBlock.classList.remove('visually-hidden');
}

const toggleBtn = document.querySelector('#toggleBtn');
toggleBtn.addEventListener('click', () => {
    toggle();
});

function toggle() {
    if (isPower)
        turnPowerOff();
    else
        turnPowerOn();
}

function turnPowerOn() {
    isPower = true;
    toggleBtn.innerHTML = 'Выключить';
    toggleBtn.classList.remove('btn-secondary', 'btn-success');
    toggleBtn.classList.add('btn-danger');
    setup();
    startLaborator();
}

function turnPowerOff() {
    isPower = false;
    toggleBtn.innerHTML = 'Включить';
    toggleBtn.classList.remove('btn-success', 'btn-danger');
    toggleBtn.classList.add('btn-secondary');
}

function startLaborator() {
    animationFrame = requestAnimationFrame(startLaborator);

    let deltaTime = new Date().getTime() - currentTime;
    currentTime = new Date().getTime();
    timePass = (currentTime - timeStart) / 1000;

    let temperature = calculateTemperature(timePass, deltaTime);
    
    graphCoordX =  calculateGraphCoordX(timePass);
    graphCoordY = calculateGraphCoordY(temperature);
    graphic.push([graphCoordX, graphCoordY]);
    
    thermocoupleCoordY = calculateThermocoupleCoordY(temperature);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateTimerLabel(timePass);
    drawThermocouple(thermocoupleCoordY);
    updateGraphic();
    
    if (temperature < roomTemp) stopLaborator();
}

function calculateThermocoupleCoordY(temperature) {
    return axisYsize - (0.035 * temperature) / thermocoupleStepY * graphNumsDistance;
}

function calculateGraphCoordX(timePass) {
    return timePass / graphStepAxisX * graphNumsDistance + graphXpos
}

function calculateGraphCoordY(temperature) {
    return axisYsize - temperature / graphStepY * graphNumsDistance
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
        meeltingAlert.classList.remove('visually-hidden');
        return meeltingTemp;
    }

    hideAlerts();
    return bodyTemp;
}

function processOverheating() {
    bodyTemp = maxTemp;
    overheatingAlert.classList.remove('visually-hidden');
    turnPowerOff();
}

function stopLaborator() {
    toggleBtn.classList.remove('btn-danger', 'btn-secondary');
    toggleBtn.classList.add('btn-success');
    
    hideAlerts();

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
        ctx.fillText((i * thermocoupleStepY) + "", thermocoupleDist * 1.5, axisYsize - i * thermocoupleNumsDistance - 5);

        ctx.fillStyle = "gray";
        ctx.fillRect(thermocoupleDist + thermocoupleDist / 4, axisYsize - i * thermocoupleNumsDistance, thermocoupleDist / 2, 1);
    }
    ctx.fillRect(thermocoupleDist + thermocoupleDist / 4, axisYsize - thermocoupleCountNumsAtY * thermocoupleNumsDistance, thermocoupleDist / 2, 1);
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

function hideAlerts() {
    meeltingAlert.classList.add('visually-hidden');
    overheatingAlert.classList.add('visually-hidden');
}

function setup() {
    hideAlerts();

    bodyTemp = roomTemp;
    timeStart = new Date();
    currentTime = timeStart;
    graphic = [[graphXpos, axisYsize]];
    setTextStyle();
    updateGraphic();
    drawThermocouple(calculateThermocoupleCoordY(bodyTemp));
    updateTimerLabel(0);
}
setup();