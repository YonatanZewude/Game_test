const imagePaths = {
  blueberry: "https://content.adoveodemo.com/1729499244809_1.png",
  strawberry: "https://content.adoveodemo.com/1729499250486_2.png",
  apple: "https://content.adoveodemo.com/1729499256359_3.png",
  banana: "https://content.adoveodemo.com/1729499262545_4.png",
  mango: "https://content.adoveodemo.com/1729499268469_5.png",
  pineapple: "https://content.adoveodemo.com/1729499274774_6.png",
  watermelon: "https://content.adoveodemo.com/1729499281547_7.png",
  drink: "https://content.adoveodemo.com/1729499295834_8.png",
};

const emojiSequence = [
  imagePaths.blueberry,
  imagePaths.strawberry,
  imagePaths.apple,
  imagePaths.banana,
  imagePaths.mango,
  imagePaths.pineapple,
  imagePaths.watermelon,
  imagePaths.drink,
];

const scoreValues = {
  [imagePaths.blueberry]: 1,
  [imagePaths.strawberry]: 2,
  [imagePaths.apple]: 3,
  [imagePaths.banana]: 4,
  [imagePaths.mango]: 5,
  [imagePaths.pineapple]: 6,
  [imagePaths.watermelon]: 7,
  [imagePaths.drink]: 9,
};

const totalCells = 25;
const MaxMovesAndGoalScore = 20;

let board = document.getElementById("board");
let score = 0;
let moves = MaxMovesAndGoalScore;
let draggedElement = null;
let originalContent = "";
let originalCell = null;
let touchElement = null;
let placeholder = null;
let gameMode = "Version1";
let activeTouchId = null;

const scoreDisplay = document.getElementById("score");
const movesDisplay = document.getElementById("moves");
const goalsSection = document.getElementById("goalsSection");
const movesSection = document.getElementById("movesSection");
const isMobile =
  "ontouchstart" in window ||
  /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);

window.onload = function () {
  document.querySelectorAll("img").forEach((img) => {
    img.addEventListener(
      "touchstart",
      function (e) {
        e.preventDefault();
      },
      { passive: false }
    );
  });
};

function switchGameMode() {
  if (gameMode === "Version 1") {
    initVersion2();
    gameMode = "Version2";
  } else {
    resetGameVersion1();
    gameMode = "Version 1";
  }
}

const nrOfGols = document.getElementById("goalsSection");
nrOfGols.innerHTML = "Goals: " + MaxMovesAndGoalScore + " " + "score";
const nrOfMoves = document.getElementById("moves");
nrOfMoves.innerHTML = MaxMovesAndGoalScore;

if (gameMode === "Version1") {
  nrOfGols.style.display = "none";
} else {
  nrOfGols.style.display = "block";
}
function resetGameVersion1() {
  gameMode = "Version1";
  score = 0;
  moves = MaxMovesAndGoalScore;
  scoreDisplay.textContent = score;
  movesDisplay.textContent = moves;

  movesSection.style.display = "block";
  goalsSection.style.display = "none";

  createBoard();
}

function createBoard() {
  board.innerHTML = "";
  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.setAttribute("draggable", true);
    const imgElement = document.createElement("img");
    imgElement.src = getRandomEmoji();
    cell.appendChild(imgElement);
    board.addEventListener("dragstart", handleDragStart);
    board.addEventListener("dragover", handleDragOver);
    board.addEventListener("drop", handleDrop);
    board.addEventListener("dragend", handleDragEnd);
    board.addEventListener("touchstart", handleTouchStart, { passive: false });
    board.addEventListener("touchmove", handleTouchMove, { passive: false });
    board.addEventListener("touchend", handleTouchEnd, { passive: false });

    board.appendChild(cell);
  }
}

document.addEventListener("selectstart", function (e) {
  e.preventDefault();
});

function initVersion2() {
  gameMode = "Version2";
  score = 0;
  moves = Infinity;

  movesSection.style.display = "none";
  goalsSection.style.display = "block";

  scoreDisplay.textContent = score;

  createBoard();
}

function checkGameOver() {
  if (gameMode === "Version1") {
    if (moves <= 0)
      showModal(
        `Game Over! You scored ${score} points in ${MaxMovesAndGoalScore} moves. Try again!`
      );
  } else if (gameMode === "Version2") {
    if (score >= MaxMovesAndGoalScore)
      showModal(`Congratulations! You reached ${score} points! You Win!`);
  }
}

function showModal(message) {
  const modal = document.getElementById("gameModal");
  document.getElementById("modalMessage").textContent = message;
  modal.style.display = "block";
}

function hideModal() {
  document.getElementById("gameModal").style.display = "none";
  location.reload();
}

function handleDragStart(event) {
  draggedElement = event.target.closest(".cell");
  originalContent = draggedElement.querySelector("img").src;
  originalCell = draggedElement;
  event.dataTransfer.setData("text/plain", originalContent);
  draggedElement.classList.add("dragging");
}

function handleDragOver(event) {
  event.preventDefault();
}
function handleDrop(event) {
  event.preventDefault();

  removeAllMatchedClasses();

  const draggedEmoji = event.dataTransfer.getData("text/plain");
  const targetCell = event.target.closest(".cell");
  const targetEmoji = targetCell.querySelector("img").src;

  const draggedEmojiFile = draggedEmoji.split("/").pop();
  const targetEmojiFile = targetEmoji.split("/").pop();

  if (draggedEmojiFile === targetEmojiFile && draggedElement !== targetCell) {
    incrementScore(draggedEmoji);
    moves--;
    document.getElementById("moves").textContent = moves;

    draggedElement.classList.add("matched");
    targetCell.classList.add("matched");

    draggedElement.addEventListener("animationend", removeMatchedClass);
    draggedElement.addEventListener("transitionend", removeMatchedClass);

    targetCell.addEventListener("animationend", removeMatchedClass);
    targetCell.addEventListener("transitionend", removeMatchedClass);

    const nextEmojis = getNextTwoEmojis(draggedEmoji);
    originalCell.querySelector("img").src = nextEmojis[0];
    targetCell.querySelector("img").src = nextEmojis[1];

    checkGameOver();
  } else {
    returnEmojiToOriginalCell();
  }
}

function removeMatchedClass(event) {
  event.target.classList.remove("matched");
}

function handleDragEnd(event) {
  draggedElement.classList.remove("dragging");
  draggedElement = null;
  originalContent = "";
  originalCell = null;
}

function returnEmojiToOriginalCell() {
  originalCell.querySelector("img").style.visibility = "visible";
}

function handleTouchStart(event) {
  if (event.touches.length > 1) return; // Ignore if there are multiple touches

  const touch = event.touches[0]; // Get the first touch point
  activeTouchId = touch.identifier;

  // Identify the cell element at the touch point
  draggedElement = document
    .elementFromPoint(touch.clientX, touch.clientY)
    ?.closest(".cell");

  if (draggedElement) {
    const imgElement = draggedElement.querySelector("img");

    if (imgElement) {
      originalContent = imgElement.src;
      originalCell = draggedElement;
      imgElement.style.visibility = "hidden"; // Hide the image in the original cell

      // Create a placeholder element and set its initial position
      placeholder = createPlaceholder(originalContent);
      document.body.appendChild(placeholder);
      movePlaceholder(touch.clientX, touch.clientY); // Position the placeholder initially
    } else {
      console.error("No <img> element found in the selected cell.");
    }
  }
}

function movePlaceholder(x, y) {
  if (placeholder) {
    // Center the placeholder under the finger by subtracting half its width and height
    placeholder.style.left = `${x - placeholder.offsetWidth / 2}px`;
    placeholder.style.top = `${y - placeholder.offsetHeight / 2}px`;
  }
}

function handleTouchMove(event) {
  event.preventDefault(); // Prevent default scrolling or other actions

  const touch = Array.from(event.touches).find(
    (t) => t.identifier === activeTouchId
  );
  if (!touch) return;

  movePlaceholder(touch.clientX, touch.clientY); // Update the placeholder position as the touch moves

  // Identify the cell that the user is currently touching
  touchElement = document
    .elementFromPoint(touch.clientX, touch.clientY)
    ?.closest(".cell");
}

function handleTouchEnd(event) {
  const touch = Array.from(event.changedTouches).find(
    (t) => t.identifier === activeTouchId
  );
  if (!touch) return;

  // Check if the touched cell matches the original cell
  removeAllMatchedClasses();

  if (touchElement && touchElement !== originalCell) {
    const draggedEmojiFile = originalContent.split("/").pop();
    const targetEmojiFile = touchElement
      .querySelector("img")
      .src.split("/")
      .pop();

    if (draggedEmojiFile === targetEmojiFile) {
      incrementScore(originalContent);
      updateMovesAndProgress();

      const [nextDraggedEmoji, nextTargetEmoji] =
        getNextTwoEmojis(draggedEmojiFile);
      updateEmojiImages(nextDraggedEmoji, nextTargetEmoji);

      draggedElement.classList.add("matched");
      touchElement.classList.add("matched");

      draggedElement.addEventListener("animationend", removeMatchedClass);
      draggedElement.addEventListener("transitionend", removeMatchedClass);

      touchElement.addEventListener("animationend", removeMatchedClass);
      touchElement.addEventListener("transitionend", removeMatchedClass);

      checkGameOver();
    } else {
      returnEmojiToOriginalCell();
    }
  } else {
    returnEmojiToOriginalCell();
  }

  cleanupTouchElements();
  activeTouchId = null;
}

function updateMovesAndProgress() {
  moves--;
  document.getElementById("moves").textContent = moves;
}

function updateEmojiImages(nextDraggedEmoji, nextTargetEmoji) {
  originalCell.querySelector("img").src = nextDraggedEmoji;
  touchElement.querySelector("img").src = nextTargetEmoji;
}

function addAndRemoveMatchedClasses() {
  draggedElement.classList.add("matched");
  touchElement.classList.add("matched");

  setTimeout(() => {
    removeAllMatchedClasses();
  }, 500);
}

function cleanupTouchElements() {
  if (placeholder) placeholder.remove();
  if (draggedElement)
    draggedElement.querySelector("img").style.visibility = "visible";
  draggedElement = null;
  touchElement = null;
  placeholder = null;
}

function removeAllMatchedClasses() {
  const matchedElements = document.querySelectorAll(".matched");
  matchedElements.forEach((element) => {
    element.classList.remove("matched");
  });
}

function createPlaceholder(src) {
  const placeholder = document.createElement("img");
  placeholder.src = src;
  placeholder.style.position = "absolute";
  placeholder.style.width = "50px";
  placeholder.style.height = "50px";
  placeholder.style.pointerEvents = "none";
  return placeholder;
}

function movePlaceholder(x, y) {
  if (placeholder) {
    placeholder.style.left = `${x - placeholder.width / 2}px`;
    placeholder.style.top = `${y - placeholder.height / 2}px`;
  }
}

function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

document.body.addEventListener("touchmove", throttle(handleTouchMove, 100));

function getNextTwoEmojis(matchedEmoji) {
  const fileName = matchedEmoji.split("/").pop();
  const matchedIndex = emojiSequence.findIndex((image) =>
    image.includes(fileName)
  );
  if (matchedIndex === -1) return [getRandomEmoji(), getRandomEmoji()];

  let nextEmoji1 = getRandomEmoji();
  let nextEmoji2 = emojiSequence[(matchedIndex + 1) % emojiSequence.length];
  while (nextEmoji1 === nextEmoji2) nextEmoji1 = getRandomEmoji();

  if (fileName === "melon.png") nextEmoji2 = imagePaths.drink;
  return [nextEmoji1, nextEmoji2];
}

function getRandomEmoji() {
  return emojiSequence[Math.floor(Math.random() * emojiSequence.length)];
}

function incrementScore(matchedEmoji) {
  const emojiFileName = matchedEmoji.split("/").pop();
  if (!Object.keys(scoreValues).some((path) => path.includes(emojiFileName)))
    return;
  score +=
    scoreValues[
      Object.keys(scoreValues).find((path) => path.includes(emojiFileName))
    ];
  document.getElementById("score").textContent = score;

  checkGameOver();
}

function resetGameVersion2() {
  score = 0;
  moves = Infinity;
  document.getElementById("score").textContent = score;
  document.getElementById("progress-bar").style.width = "0%";

  const movesSection = document.getElementById("movesSection");
  const goalsSection = document.getElementById("goalsSection");

  if (movesSection) movesSection.style.display = "none";
  if (goalsSection) goalsSection.style.display = "block";

  createBoard();
}

function resetGame() {
  location.reload();
}

createBoard();

document.getElementById("modalButton").addEventListener("click", hideModal);
document.querySelector(".modal .close").addEventListener("click", hideModal);
window.addEventListener("click", (event) => {
  if (event.target === document.getElementById("gameModal")) hideModal();
});
