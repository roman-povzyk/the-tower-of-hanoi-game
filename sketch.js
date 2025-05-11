// --- UI Елементи ---
let numDisksInput;
let startButton;
let retryButton;
let continueButton;

// --- Стан Гри та Параметри ---
let towers = [[], [], []];
let numDisks = 3;
let diskHeight = 22;
let maxDiskWidth;
let minDiskWidth = 30;

let selectedDisk = null; 
let sourcePegIndex = -1; 
let diskDragOffsetY = -diskHeight * 0.4; 

let moves = 0;
let minPossibleMoves = 0;
let gameState = 'title';
let currentLevel = 1;

// --- Історія ходів для Undo ---
let moveHistory = [];

// --- Кнопки ---
let homeButtonX, homeButtonY, homeButtonSize;
let undoButtonX, undoButtonY, undoButtonSize;
let rulesButtonX, rulesButtonY, rulesButtonSize; // Для кнопки правил


// --- Геометрія Стовпчиків ---
let pegXPositions;
let pegYBase; 
let pegBodyY; 
let pegWidth = 10;
let pegVisualHeight = 180;
let pegBaseHeight = 15;


// --- Кольори ---
let backgroundColor = '#F5F5F7';
let textColor = '#1D1D1F'; 
let secondaryTextColor = '#6E6E73';
let pegColorLight = '#D1D1D6';
let pegBaseColor = '#E5E5EA';
let accentColorGreen = '#28A745'; 
let accentColorBlue = '#007AFF'; 
let accentColorRed = '#FF3B30';
let diskBaseColors = [];
let diskHighlightColor;

// --- Параметри Рівнів ---
const START_DISKS = 3;
const MAX_DISKS_FOR_LEVELS = 8;
let NUM_GAME_LEVELS;

// --- Константи для візуалізації прогресу рівнів ---
let levelMarkerPositions = [];
const MARKER_Y_POS = 100;
const MARKER_SPACING = 60;
const MARKER_SIZE = 30;
const PLAYER_ICON_SIZE = 14;
const MARKER_COLOR_LOCKED = '#D1D1D6';
const MARKER_COLOR_ACTIVE = '#B0B0B0';
const MARKER_COLOR_COMPLETED = accentColorGreen;
let PLAYER_ICON_COLOR;

// --- Анімація та Переходи ---
const PLAYER_ANIM_DURATION = 60;
const LEVEL_MSG_DURATION = 75;
const CANDY_VISUAL_DURATION = 180; 

let candies = []; 
let transitionTimer = 0;

let playerIconPos;
let playerIconIsMoving = false;

// --- Шрифти ---
const mainTextFont = 'Nunito Sans, Helvetica Neue, Arial, sans-serif';
// const boldTextFont = 'Nunito Sans, Helvetica Neue, Arial, sans-serif'; // Жирність через textStyle

// --- DOM елементи ---
let modalOverlay; // Для модалки "спробувати ще раз"
let modalMessageP;
let rulesModalOverlay; // Для модалки правил
let closeRulesButton;

// --- Константи та змінні для кнопки "Рівень X" ---
let levelButtonX, levelButtonY, levelButtonWidth, levelButtonHeight;
const LEVEL_BUTTON_BASE_COLOR = '#007AFF';
const LEVEL_BUTTON_HOVER_COLOR = '#0056b3';
const LEVEL_BUTTON_TEXT_COLOR = '#FFFFFF';

// --- Змінні для Drag-and-Drop ---
let isDragging = false; 


// --- Класи Particle та Candy ---
class Candy { 
  constructor(x, y) {
    this.pos = createVector(x || random(width), y || random(-height * 0.5, -20));
    this.vel = createVector(random(-0.5, 0.5), random(1.5, 3.5)); 
    this.acc = createVector(0, 0.05); 
    this.size = random(8, 16);
    if (diskBaseColors && diskBaseColors.length > 0) {
        this.color = diskBaseColors[floor(random(diskBaseColors.length))];
    } else {
        this.color = color(random(255), random(255), random(255)); 
    }
    this.angle = random(TWO_PI);
    this.rotationSpeed = random(-0.05, 0.05);
    this.type = random(['circle', 'rect']); 
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.angle += this.rotationSpeed;
  }

  isOffScreen() {
    return (this.pos.y > height + this.size); 
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    fill(this.color);
    noStroke();
    if (this.type === 'circle') {
      ellipse(0, 0, this.size, this.size);
    } else {
      rectMode(CENTER);
      rect(0, 0, this.size, this.size * 0.6, this.size * 0.2); 
    }
    pop();
  }
}


function setup() {
  let canvasContainer = select('#game-canvas-container');
  let canvas = createCanvas(600, 480);
   if (canvasContainer) {
    canvas.parent(canvasContainer);
  } else {
    console.warn('#game-canvas-container not found in HTML.');
  }

  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  textFont(mainTextFont);

  PLAYER_ICON_COLOR = accentColorBlue;

  diskBaseColors = [
    color(255, 69, 58), color(255, 159, 10), color(255, 214, 10),
    color(52, 199, 89), color(10, 132, 255), color(94, 92, 230),
    color(191, 90, 242), color(255, 55, 95)
  ];
  diskHighlightColor = color(255, 255, 255, 70);

  NUM_GAME_LEVELS = MAX_DISKS_FOR_LEVELS - START_DISKS + 1;
  setupLevelMarkers();
  playerIconPos = createVector(0,0);

  let uiContainer = select('#game-ui-container');

  numDisksInput = createInput(str(numDisks));
  numDisksInput.size(45, 30);
  numDisksInput.style('font-family', mainTextFont);
  numDisksInput.style('font-size', '16px');
  numDisksInput.style('padding', '0 5px');
  numDisksInput.style('text-align', 'center');
  numDisksInput.style('border', `1px solid ${pegColorLight}`);
  numDisksInput.style('border-radius', '8px');
  numDisksInput.style('background-color', '#E9E9ED');
  numDisksInput.style('color', textColor);
  numDisksInput.attribute('readonly', '');
  if (uiContainer) numDisksInput.parent(uiContainer);

  startButton = createButton('Нова сесія'); 
  startButton.size(130, 38); 
  startButton.style('font-family', mainTextFont);
  startButton.style('font-size', '16px');
  startButton.style('font-weight', '700');
  startButton.style('background-color', accentColorBlue);
  startButton.style('color', 'white');
  startButton.style('border', 'none');
  startButton.style('border-radius', '8px');
  startButton.style('cursor', 'pointer');
  startButton.mousePressed(() => resetToLevelOne(true)); 
  if (uiContainer) startButton.parent(uiContainer);

  modalOverlay = select('#modal-level-complete-options');
  modalMessageP = select('#modal-message');
  let modalButtonsContainer = select('#modal-level-complete-options .modal-buttons'); 

  retryButton = createButton('Так');
  retryButton.style('font-family', mainTextFont);
  retryButton.style('font-weight', '700');
  retryButton.style('background-color', accentColorGreen);
  retryButton.style('color', 'white');
  retryButton.style('border', 'none');
  retryButton.style('border-radius', '8px');
  retryButton.style('cursor', 'pointer');
  retryButton.style('padding', '10px 15px'); // Додаємо padding, щоб CSS !important не був потрібен
  retryButton.style('font-size', '1em');
  retryButton.mousePressed(retryCurrentLevel);
  if (modalButtonsContainer) {
    retryButton.parent(modalButtonsContainer);
  } else {
    console.error("Контейнер .modal-buttons для #modal-level-complete-options не знайдено!");
  }


  continueButton = createButton('Ні');
  continueButton.style('font-family', mainTextFont);
  continueButton.style('font-weight', '700');
  continueButton.style('background-color', accentColorRed);
  continueButton.style('color', 'white');
  continueButton.style('border', 'none');
  continueButton.style('border-radius', '8px');
  continueButton.style('cursor', 'pointer');
  continueButton.style('padding', '10px 15px');
  continueButton.style('font-size', '1em');
  continueButton.mousePressed(proceedToNextLevelSetup);
  if (modalButtonsContainer) {
    continueButton.parent(modalButtonsContainer);
  }

  rulesModalOverlay = select('#modal-rules');
  closeRulesButton = select('#close-rules-button');
  if (closeRulesButton) {
    closeRulesButton.mousePressed(() => {
      if (rulesModalOverlay) rulesModalOverlay.removeClass('active');
    });
  }
  if (rulesModalOverlay) {
    rulesModalOverlay.mousePressed((event) => {
        if (event.target === rulesModalOverlay.elt) { 
            rulesModalOverlay.removeClass('active');
        }
    });
  }

  let totalPegsWidth = width * 0.85; 
  pegXPositions = [
    width / 2 - totalPegsWidth / 3,
    width / 2,
    width / 2 + totalPegsWidth / 3
  ];
  pegYBase = height - 75;
  pegBodyY = pegYBase - pegBaseHeight / 2 - pegVisualHeight / 2;
  maxDiskWidth = (pegXPositions[1] - pegXPositions[0]) * 0.85; 

  homeButtonSize = 30;
  homeButtonX = 35;
  homeButtonY = 35;

  undoButtonSize = 30;
  undoButtonX = homeButtonX + homeButtonSize + 20; 
  undoButtonY = homeButtonY;

  rulesButtonSize = 30;
  rulesButtonX = width - 35; 
  rulesButtonY = 35;       

  levelButtonWidth = 200;
  levelButtonHeight = 60;
  levelButtonX = width / 2;
  
  updateUIForState();
}

function setupLevelMarkers() {
    levelMarkerPositions = [];
    let totalWidthOfMarkers = (NUM_GAME_LEVELS - 1) * MARKER_SPACING;
    let startX = (width - totalWidthOfMarkers) / 2;
    for (let i = 0; i < NUM_GAME_LEVELS; i++) {
        levelMarkerPositions.push(createVector(startX + i * MARKER_SPACING, MARKER_Y_POS));
    }
}

function resetToLevelOne(goToTitle = true) { 
    if (goToTitle) { 
        currentLevel = 1;
        numDisks = START_DISKS;
    }
    resetGameInternals(); 
    
    numDisksInput.value(str(numDisks)); 
    if (startButton) { 
        startButton.html('Нова сесія'); 
    }
    
    if (goToTitle) {
        gameState = 'title';
    } else {
        gameState = 'preparingNextLevel'; 
        transitionTimer = LEVEL_MSG_DURATION; 
        playerIconIsMoving = false; 
        if (levelMarkerPositions.length > 0 && levelMarkerPositions[currentLevel - 1]) {
             playerIconPos.set(levelMarkerPositions[currentLevel - 1]);
        }
    }
    updateUIForState();
}


function initiateNewGame() {
  gameState = 'playing';
  numDisksInput.value(str(numDisks));
  resetGameInternals(); 
  updateUIForState();
}

function resetGameInternals() {
  towers = [[], [], []]; 
  for (let i = numDisks; i > 0; i--) {
    towers[0].push(i);
  }
  selectedDisk = null;
  sourcePegIndex = -1;
  isDragging = false; 
  moves = 0;
  minPossibleMoves = pow(2, numDisks) - 1;
  moveHistory = []; 
}

function updateUIForState() {
    if (numDisksInput) numDisksInput.hide();
    if (startButton) startButton.hide();
    if (modalOverlay) modalOverlay.removeClass('active');
    if (rulesModalOverlay) rulesModalOverlay.removeClass('active');

    if (gameState === 'title') {
        // UI елементи не показуються
    } else if (gameState === 'playing') {
        if (numDisksInput) numDisksInput.show();
        if (startButton) startButton.show();
    } else if (gameState === 'levelCompleteOptions') {
        if (modalOverlay && modalMessageP) {
            modalMessageP.html(`Але цей рівень можна було пройти за ${minPossibleMoves} ходів.<br>Хочете спробувати перепройти його?`);
            modalOverlay.addClass('active');
        }
    } else if (gameState === 'allLevelsComplete') {
        if (startButton) {
            startButton.html('Грати Знову'); 
            startButton.show();
        }
    }
}


function draw() {
  background(backgroundColor);
  textFont(mainTextFont);

  if (gameState === 'title') {
    drawTitleScreen();
  } else if (gameState === 'playing') {
    drawPegs();
    drawDisks();
    if (isDragging && selectedDisk !== null) { 
      drawSelectedDisk();
    }
    drawInfo();
    drawUndoButton(); 
  } else if (gameState === 'fireworks') { 
    drawVictoryScreen(); 
  } else if (gameState === 'levelCompleteOptions') {
    drawPegs(); 
    drawDisks();
    drawInfo(); 
  } else if (gameState === 'preparingNextLevel') {
    drawPreparingNextLevelScreen();
  } else if (gameState === 'allLevelsComplete') {
    drawAllLevelsCompleteScreen();
  }

  drawHomeButton();
  drawRulesButton(); 
}

function drawHomeButton() { 
  if (gameState !== 'title' && gameState !== 'allLevelsComplete') {
    push();
    let hover = dist(mouseX, mouseY, homeButtonX, homeButtonY) < (homeButtonSize + 10) / 2;
    if (hover && gameState !== 'levelCompleteOptions' && (!rulesModalOverlay || !rulesModalOverlay.hasClass('active')) ) { 
      fill(220, 220, 240, 200);
      cursor(HAND);
    } else {
      fill(200, 200, 220, 150);
    }
    noStroke();
    ellipse(homeButtonX, homeButtonY, homeButtonSize + 10, homeButtonSize + 10);

    fill(textColor);
    textSize(homeButtonSize * 0.65);
    textAlign(CENTER, CENTER);
    text("🏠", homeButtonX, homeButtonY +1);
    pop();
  } else {
     if (cursor() !== ARROW && !mouseIsPressed && gameState !== 'levelCompleteOptions' && (!rulesModalOverlay || !rulesModalOverlay.hasClass('active'))) { 
       cursor(ARROW);
     }
  }
}

function drawUndoButton() { 
  if (gameState === 'playing' && moveHistory.length > 0) {
    push();
    let hover = dist(mouseX, mouseY, undoButtonX, undoButtonY) < (undoButtonSize + 10) / 2;
    if (hover && gameState !== 'levelCompleteOptions' && (!rulesModalOverlay || !rulesModalOverlay.hasClass('active'))) {
      fill(220, 220, 240, 200); 
      cursor(HAND);
    } else {
      fill(200, 200, 220, 150);
    }
    noStroke();
    ellipse(undoButtonX, undoButtonY, undoButtonSize + 10, undoButtonSize + 10);

    fill(textColor);
    textSize(undoButtonSize * 0.7); 
    textAlign(CENTER, CENTER);
    text("↩", undoButtonX, undoButtonY + 2); 
    pop();
  } else if (gameState === 'playing' && moveHistory.length === 0) {
    push();
    fill(180, 180, 190, 100); 
    noStroke();
    ellipse(undoButtonX, undoButtonY, undoButtonSize + 10, undoButtonSize + 10);
    fill(textColorAlpha(textColor, 100)); 
    textSize(undoButtonSize * 0.7);
    textAlign(CENTER, CENTER);
    text("↩", undoButtonX, undoButtonY + 2);
    pop();
  }
}

function drawRulesButton() {
  if (rulesModalOverlay && !rulesModalOverlay.hasClass('active')) {
    push();
    let hover = dist(mouseX, mouseY, rulesButtonX, rulesButtonY) < (rulesButtonSize + 10) / 2;
    if (hover && gameState !== 'levelCompleteOptions') { 
      fill(220, 220, 240, 200);
      cursor(HAND);
    } else {
      fill(200, 200, 220, 150);
    }
    noStroke();
    ellipse(rulesButtonX, rulesButtonY, rulesButtonSize + 10, rulesButtonSize + 10);

    fill(textColor);
    textSize(rulesButtonSize * 0.65);
    textAlign(CENTER, CENTER);
    text("📖", rulesButtonX, rulesButtonY + 1); 
    pop();
  }
}


function drawLevelButton(levelNum, yPos) { 
  push();
  levelButtonY = yPos;

  let isHovering = mouseX > levelButtonX - levelButtonWidth / 2 &&
                   mouseX < levelButtonX + levelButtonWidth / 2 &&
                   mouseY > levelButtonY - levelButtonHeight / 2 &&
                   mouseY < levelButtonY + levelButtonHeight / 2;

  if (isHovering && gameState !== 'levelCompleteOptions' && (!rulesModalOverlay || !rulesModalOverlay.hasClass('active'))) {
    fill(LEVEL_BUTTON_HOVER_COLOR);
    cursor(HAND);
  } else {
    fill(LEVEL_BUTTON_BASE_COLOR);
  }
  noStroke();
  rect(levelButtonX, levelButtonY, levelButtonWidth, levelButtonHeight, 10);

  fill(LEVEL_BUTTON_TEXT_COLOR);
  textFont(mainTextFont);
  textStyle(BOLD);
  textSize(24);
  textAlign(CENTER, CENTER);
  text(`Рівень ${levelNum}`, levelButtonX, levelButtonY);
  textStyle(NORMAL);
  pop();
}


function drawTitleScreen() { 
  textAlign(CENTER, CENTER);
  if (levelMarkerPositions.length > 0 && NUM_GAME_LEVELS > 0) {
    textFont(mainTextFont);
    drawLevelMarkersVisual(1);
    let firstMarkerPos = levelMarkerPositions[0];
     if(firstMarkerPos) {
        fill(PLAYER_ICON_COLOR);
        noStroke();
        ellipse(firstMarkerPos.x, firstMarkerPos.y, PLAYER_ICON_SIZE, PLAYER_ICON_SIZE);
     }
  }
  drawLevelButton(1, height / 2 + 40);
}

function drawVictoryScreen() { 
  if (random(1) < 0.25 && candies.length < 100) { 
    candies.push(new Candy());
  }

  for (let i = candies.length - 1; i >= 0; i--) {
    candies[i].update();
    candies[i].show();
    if (candies[i].isOffScreen()) {
      candies.splice(i, 1);
    }
  }
  
  textAlign(CENTER, CENTER);
  textFont(mainTextFont); 

  fill(accentColorGreen); 
  textSize(56); 
  textStyle(BOLD);      
  text('Перемога!', width / 2, height / 2 - 40); 
  
  textStyle(NORMAL);    
  fill(textColor);      
  textSize(24); 
  text(`Ви впорались за ${moves} ходів.`, width / 2, height / 2 + 25);

  if (moves === minPossibleMoves) {
      fill(textColor);      
      textSize(20);
      text('Ідеальний результат!', width / 2, height / 2 + 65);
  }
 
  transitionTimer--;
  if (transitionTimer <= 0) {
    candies = []; 
    if (moves === minPossibleMoves) {
      proceedToNextLevelSetup();
    } else {
      gameState = 'levelCompleteOptions'; 
      updateUIForState();
    }
  }
}


function retryCurrentLevel() { 
    initiateNewGame();
}

function proceedToNextLevelSetup() { 
    if (numDisks >= MAX_DISKS_FOR_LEVELS) {
        gameState = 'allLevelsComplete';
    } else {
        currentLevel++;
        numDisks++;
        gameState = 'preparingNextLevel';
        transitionTimer = PLAYER_ANIM_DURATION + LEVEL_MSG_DURATION;
        playerIconIsMoving = true;
    }
    updateUIForState();
}

function drawPreparingNextLevelScreen() { 
  textAlign(CENTER, CENTER);
  textFont(mainTextFont);

  if (levelMarkerPositions.length > 0 && NUM_GAME_LEVELS > 0) {
    drawLevelMarkersVisual(currentLevel);
  }

  let timeForPlayerAnimation = transitionTimer - LEVEL_MSG_DURATION;
  let targetMarkerIndex = constrain(currentLevel - 1, 0, NUM_GAME_LEVELS - 1);

  if (levelMarkerPositions[targetMarkerIndex]) {
    let targetPos = levelMarkerPositions[targetMarkerIndex];
    if (playerIconIsMoving && timeForPlayerAnimation > 0 && currentLevel > 1) {
        let prevMarkerIndex = constrain(currentLevel - 2, 0, NUM_GAME_LEVELS - 1);
        if (levelMarkerPositions[prevMarkerIndex]) {
            let startPos = levelMarkerPositions[prevMarkerIndex];
            let lerpFactor = 1.0 - (timeForPlayerAnimation / PLAYER_ANIM_DURATION);
            lerpFactor = constrain(lerpFactor, 0, 1);
            playerIconPos = p5.Vector.lerp(startPos, targetPos, lerpFactor);
        } else {
             playerIconPos.set(targetPos);
             playerIconIsMoving = false;
        }
    } else {
        playerIconPos.set(targetPos);
        playerIconIsMoving = false;
    }
    fill(PLAYER_ICON_COLOR);
    noStroke();
    ellipse(playerIconPos.x, playerIconPos.y, PLAYER_ICON_SIZE, PLAYER_ICON_SIZE);
  }

  if (timeForPlayerAnimation <= 0 || !playerIconIsMoving) {
    drawLevelButton(currentLevel, height / 2 + 40);
  } else {
    fill(textColor);
    textSize(36);
    textFont(mainTextFont); 
    textStyle(BOLD);       
    text(`Рівень ${currentLevel}`, width / 2, height / 2 + 30);
    textStyle(NORMAL);     
  }

  transitionTimer--;
  if (transitionTimer <= 0 && playerIconIsMoving) {
      playerIconIsMoving = false;
  }
}

function drawLevelMarkersVisual(activeGameLevel) { 
  textFont(mainTextFont);
  for (let i = 0; i < NUM_GAME_LEVELS; i++) {
    let markerPos = levelMarkerPositions[i];
    let levelNumForMarker = i + 1;

    if (levelNumForMarker < activeGameLevel) {
      fill(MARKER_COLOR_COMPLETED);
    } else if (levelNumForMarker === activeGameLevel) {
      fill(MARKER_COLOR_ACTIVE);
    } else {
      fill(MARKER_COLOR_LOCKED);
    }
    noStroke();
    ellipse(markerPos.x, markerPos.y, MARKER_SIZE, MARKER_SIZE);

    fill(textColor);
    textSize(MARKER_SIZE * 0.55);
    text(levelNumForMarker, markerPos.x, markerPos.y);
  }
}

function drawAllLevelsCompleteScreen() { 
    textAlign(CENTER, CENTER);
    fill(accentColorGreen);
    textSize(48);
    textFont(mainTextFont);
    textStyle(BOLD);
    text('Всі Рівні Пройдено!', width / 2, height / 2 - 40);

    textStyle(NORMAL);
    fill(textColor);
    textSize(20);
    text('Ви неймовірні! 🎉', width / 2, height / 2 + 20);
}


function drawPegs() { 
  noStroke();
  for (let i = 0; i < 3; i++) {
    let pegIsTargetable = true;
    let alphaValue = 255; 

    if (selectedDisk !== null) { 
      pegIsTargetable = (towers[i].length === 0 || selectedDisk < towers[i][towers[i].length - 1]);
      if (!pegIsTargetable) {
        alphaValue = 100; 
      }
    }

    fill(red(pegBaseColor), green(pegBaseColor), blue(pegBaseColor), alphaValue); 
    rect(pegXPositions[i], pegYBase - pegBaseHeight / 2, maxDiskWidth + 20, pegBaseHeight, 6);

    fill(red(pegColorLight), green(pegColorLight), blue(pegColorLight), alphaValue); 
    rect(pegXPositions[i], pegBodyY, pegWidth, pegVisualHeight, pegWidth / 2);

    if (errorPegIndex === i && errorHighlightFrames > 0) {
        fill(255, 0, 0, map(errorHighlightFrames, 0, 15, 0, 100));
        rect(pegXPositions[i], pegBodyY, pegWidth + 10, pegVisualHeight + 10, (pegWidth + 10)/2);
        errorHighlightFrames--;
        if (errorHighlightFrames === 0) errorPegIndex = -1;
    }
  }
}

function applyDiskShadow() {
  drawingContext.shadowOffsetX = 0;
  drawingContext.shadowOffsetY = 3;
  drawingContext.shadowBlur = 8;
  drawingContext.shadowColor = 'rgba(0, 0, 0, 0.15)';
}

function clearShadow() {
  drawingContext.shadowOffsetX = 0;
  drawingContext.shadowOffsetY = 0;
  drawingContext.shadowBlur = 0;
  drawingContext.shadowColor = 'rgba(0, 0, 0, 0)';
}

function drawDisks() { 
  if (diskBaseColors.length === 0) return;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < towers[i].length; j++) {
      let diskSize = towers[i][j];
      let diskW = map(diskSize, 1, numDisks, minDiskWidth, maxDiskWidth);
      let x = pegXPositions[i];
      
      let topOfPegBase = pegYBase - pegBaseHeight;
      let y = topOfPegBase - diskHeight / 2 - (j * diskHeight);

      applyDiskShadow();
      let baseC = diskBaseColors[(diskSize - 1) % diskBaseColors.length];
      fill(baseC);
      noStroke();
      rect(x, y, diskW, diskHeight, 8);

      fill(diskHighlightColor);
      rect(x, y - diskHeight * 0.22, diskW * 0.9, diskHeight * 0.35, 5);
      clearShadow();
    }
  }
}

function drawSelectedDisk() { 
  if (selectedDisk === null || diskBaseColors.length === 0) return;
  let diskW = map(selectedDisk, 1, numDisks, minDiskWidth, maxDiskWidth);
  let diskDrawX = mouseX; 
  let diskDrawY = mouseY + diskDragOffsetY; 

  applyDiskShadow();
  drawingContext.shadowOffsetY = 6; 
  drawingContext.shadowBlur = 16;
  let baseC = diskBaseColors[(selectedDisk - 1) % diskBaseColors.length];
  fill(baseC);
  noStroke();
  rect(diskDrawX, diskDrawY, diskW, diskHeight, 8);
  fill(diskHighlightColor);
  rect(diskDrawX, diskDrawY - diskHeight * 0.22, diskW * 0.9, diskHeight * 0.35, 5);
  clearShadow();
}

function drawInfo() {
  textFont(mainTextFont);
  noStroke();
  
  fill(textColor);
  textSize(18);
  textAlign(CENTER, TOP);
  let textY = 25;
  text(`Ходів: ${moves}`, width / 2, textY);
  
  textAlign(LEFT, TOP);
  textSize(16);
  fill(secondaryTextColor);
  text(`Рівень: ${currentLevel}`, undoButtonX + undoButtonSize + 15, textY +1); 
  
  if (numDisksInput && numDisksInput.elt.style.display !== 'none') {
      // Текст біля DOM інпута прибраний
  }
}


function mousePressed() {
  let handCursorNeeded = false; 

  if (rulesModalOverlay && rulesModalOverlay.hasClass('active')) {
    return;
  }
  
  if (gameState !== 'levelCompleteOptions') { 
    let dRules = dist(mouseX, mouseY, rulesButtonX, rulesButtonY);
    if (dRules < (rulesButtonSize + 10) / 2) {
      if (rulesModalOverlay) rulesModalOverlay.addClass('active');
      cursor(ARROW);
      return; 
    }

    if (gameState !== 'title' && gameState !== 'allLevelsComplete') {
      let dHome = dist(mouseX, mouseY, homeButtonX, homeButtonY);
      if (dHome < (homeButtonSize + 10) / 2) {
        resetToLevelOne(false); 
        cursor(ARROW); 
        return;
      }
    }

    if (gameState === 'playing' && moveHistory.length > 0) {
      let dUndo = dist(mouseX, mouseY, undoButtonX, undoButtonY);
      if (dUndo < (undoButtonSize + 10) / 2) {
        undoLastMove();
        cursor(ARROW);
        return;
      }
    }
  }


  if (gameState === 'title') {
    let titleLevelButtonY = height / 2 + 40;
    if (mouseX > levelButtonX - levelButtonWidth / 2 &&
        mouseX < levelButtonX + levelButtonWidth / 2 &&
        mouseY > titleLevelButtonY - levelButtonHeight / 2 &&
        mouseY < titleLevelButtonY + levelButtonHeight / 2) {
      currentLevel = 1;
      numDisks = START_DISKS;
      initiateNewGame();
      cursor(ARROW);
      return;
    }
  }

  if (gameState === 'preparingNextLevel') {
    let preparingLevelButtonY = height / 2 + 40;
    let timeForPlayerAnimation = transitionTimer - LEVEL_MSG_DURATION;
    if ((timeForPlayerAnimation <= 0 || !playerIconIsMoving) &&
        mouseX > levelButtonX - levelButtonWidth / 2 &&
        mouseX < levelButtonX + levelButtonWidth / 2 &&
        mouseY > preparingLevelButtonY - levelButtonHeight / 2 &&
        mouseY < preparingLevelButtonY + levelButtonHeight / 2) {
      initiateNewGame();
      cursor(ARROW);
      return;
    }
  }
  
  if (event && event.target) {
    const targetElement = event.target;
    if ((startButton && startButton.elt.contains(targetElement)) ||
        (retryButton && retryButton.elt.contains(targetElement)) ||
        (continueButton && continueButton.elt.contains(targetElement))) {
      return;
    }
  }

  if (gameState === 'playing') {
     if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;
    
    if (!isDragging) { 
      let clickedPeg = getClickedPeg(); 
      if (clickedPeg !== -1 && towers[clickedPeg].length > 0) {
        selectedDisk = towers[clickedPeg].pop(); 
        sourcePegIndex = clickedPeg;
        isDragging = true;
      }
    }
  }

  // Керування курсором
  let UIMaskActive = (gameState === 'levelCompleteOptions' || (rulesModalOverlay && rulesModalOverlay.hasClass('active')));

  if (gameState !== 'title' && gameState !== 'allLevelsComplete' && !UIMaskActive) {
    if (dist(mouseX, mouseY, homeButtonX, homeButtonY) < (homeButtonSize + 10) / 2) {
      handCursorNeeded = true;
    }
    if (gameState === 'playing' && moveHistory.length > 0 && dist(mouseX, mouseY, undoButtonX, undoButtonY) < (undoButtonSize + 10) / 2) {
      handCursorNeeded = true;
    }
     if (dist(mouseX, mouseY, rulesButtonX, rulesButtonY) < (rulesButtonSize + 10) / 2) {
      handCursorNeeded = true;
    }
  }
  if ((gameState === 'title' || gameState === 'preparingNextLevel') && !UIMaskActive) {
      let btnY = height / 2 + 40;
      if (mouseX > levelButtonX - levelButtonWidth / 2 && mouseX < levelButtonX + levelButtonWidth / 2 &&
          mouseY > btnY - levelButtonHeight / 2 && mouseY < btnY + levelButtonHeight / 2) {
          if (gameState === 'preparingNextLevel' && (transitionTimer - LEVEL_MSG_DURATION > 0 && playerIconIsMoving)) {
          } else {
              handCursorNeeded = true;
          }
      }
  }

  if (!handCursorNeeded && !UIMaskActive) { 
    if (cursor() !== ARROW) cursor(ARROW);
  } else if (handCursorNeeded && !UIMaskActive) {
    if (cursor() !== HAND) cursor(HAND);
  }
}

function mouseDragged() {
  if (gameState === 'playing' && isDragging && selectedDisk !== null) {
  }
}

function mouseReleased() {
  if (gameState === 'playing' && isDragging && selectedDisk !== null) {
    let targetPeg = getClickedPeg(); 

    if (targetPeg !== -1 && (towers[targetPeg].length === 0 || selectedDisk < towers[targetPeg][towers[targetPeg].length - 1])) {
      moveHistory.push({
        disk: selectedDisk,
        fromPeg: sourcePegIndex,
        toPeg: targetPeg
      });

      towers[targetPeg].push(selectedDisk);
      if (targetPeg !== sourcePegIndex) {
        moves++;
      }
      checkWinCondition();
    } else {
      towers[sourcePegIndex].push(selectedDisk); 
      if (targetPeg !== -1 && targetPeg !== sourcePegIndex) { 
         triggerErrorFeedback(targetPeg);
      }
    }
    selectedDisk = null;
    sourcePegIndex = -1;
    isDragging = false;
  }
  if (!mouseIsPressed) { 
      if(isDragging && selectedDisk !== null && sourcePegIndex !== -1){ 
          towers[sourcePegIndex].push(selectedDisk); 
          selectedDisk = null;
          sourcePegIndex = -1;
      }
      isDragging = false;
  }
}

function undoLastMove() {
  if (moveHistory.length > 0) {
    let lastMove = moveHistory.pop();
    
    if (towers[lastMove.toPeg].length > 0 && towers[lastMove.toPeg][towers[lastMove.toPeg].length -1] === lastMove.disk) {
        let diskToMove = towers[lastMove.toPeg].pop(); 
        towers[lastMove.fromPeg].push(diskToMove);
        moves++; 
    } else {
        console.warn("Undo: Disk not found on target peg or disk mismatch.", lastMove);
    }
    
    selectedDisk = null;
    sourcePegIndex = -1;
    isDragging = false;
  }
}


let errorPegIndex = -1;
let errorHighlightFrames = 0;

function triggerErrorFeedback(pegIndex) {
    errorPegIndex = pegIndex;
    errorHighlightFrames = 20;
}

function getClickedPeg() {
  for (let i = 0; i < 3; i++) { 
    let clickTopY = pegBodyY - pegVisualHeight / 2;
    let clickBottomY = pegYBase;
    if (mouseX > pegXPositions[i] - (maxDiskWidth + 20) / 2 &&
        mouseX < pegXPositions[i] + (maxDiskWidth + 20) / 2 &&
        mouseY > clickTopY &&
        mouseY < clickBottomY) {
      return i;
    }
  }
  return -1; 
}

function checkWinCondition() {
  if (gameState !== 'playing') return;

  if (towers[0].length === 0 && (towers[1].length === numDisks || towers[2].length === numDisks)) {
    gameState = 'fireworks'; 
    transitionTimer = CANDY_VISUAL_DURATION; 
    updateUIForState();
  }
}

function textColorAlpha(c, alpha) {
  return color(red(c), green(c), blue(c), alpha);
}