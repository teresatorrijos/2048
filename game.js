function Game2048() {
  this.board = [
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null]
  ];

  this.score = 0;
  this.won = false;
  this.lost = false;

  this._generateTile();
  this._generateTile();
}

Game2048.prototype._renderBoard = function() {
  //this.board.forEach(function(row){ console.log(row); });
  console.table(this.board);
  console.log('Score: ' + this.score);
};

Game2048.prototype._generateTile = function() {
  var initialValue = (Math.random() < 0.8) ? 2 : 4;
  var emptyTile = this._getAvailablePosition();
  if (emptyTile) {
    this.board[emptyTile.x][emptyTile.y] = initialValue;
  }
};

Game2048.prototype._getAvailablePosition = function() {
  var emptyTiles = [];

  this.board.forEach(function(row, rowIndex) {
    row.forEach(function(elem, colIndex) {
      if (!elem) emptyTiles.push({
        x: rowIndex,
        y: colIndex
      });
    });
  });

  if (emptyTiles.length === 0)
    return false;

  var randomPosition = Math.floor(Math.random() * emptyTiles.length);
  return emptyTiles[randomPosition];
};

Game2048.prototype._updateScore = function(value) {
  this.score += value;
  if (value === 2048) {
    this.won = true;
  }
};


Game2048.prototype._moveLeft = function() {
  var newBoard = [];
  var that = this;

  this.board.forEach(function(row) {
    var newRow = row.filter(function(e) {
      return e !== null;
    });

    for (i = 0; i < newRow.length - 1; i++) {
      if (newRow[i + 1] === newRow[i]) {
        newRow[i] = newRow[i] * 2;
        newRow[i + 1] = null;
        that._updateScore(newRow[i]);
        ion.sound.play("tap");
      }
    }

    var merged = newRow.filter(function(i) {
      return i !== null;
    });

    while (merged.length < 4) {
      merged.push(null);
    }
    newBoard.push(merged);
  });

  var boardChanged = !_.isEqual(newBoard, this.board);
  this.board = newBoard;
  return boardChanged;
};


Game2048.prototype._moveRight = function() {
  var newBoard = [];
  var that = this;

  this.board.forEach(function(row) {
    var newRow = row.filter(function(e) {
      return e !== null;
    });

    for (i = newRow.length - 1; i > 0; i--) {
      if (newRow[i - 1] === newRow[i]) {
        newRow[i] = newRow[i] * 2;
        newRow[i - 1] = null;
        that._updateScore(newRow[i]);
        ion.sound.play("tap");
      }
    }

    var merged = newRow.filter(function(i) {
      return i !== null;
    });

    while (merged.length < 4) {
      merged.unshift(null);
    }

    newBoard.push(merged);
  });
  var boardChanged = !_.isEqual(newBoard, this.board);
  this.board = newBoard;
  return boardChanged;
};

Game2048.prototype._transposeMatrix = function() {
  for (var row = 0; row < this.board.length; row++) {
    for (var column = row + 1; column < this.board.length; column++) {
      var temp = this.board[row][column];
      this.board[row][column] = this.board[column][row];
      this.board[column][row] = temp;
    }
  }
};

Game2048.prototype._moveUp = function() {
  this._transposeMatrix();
  var boardChanged = this._moveLeft();
  this._transposeMatrix();
  return boardChanged;
};

Game2048.prototype._moveDown = function() {
  this._transposeMatrix();
  var boardChanged = this._moveRight();
  this._transposeMatrix();
  return boardChanged;
};

Game2048.prototype.win = function () {
  return this.won;
};

Game2048.prototype._gameFinished = function(){
  if(this.won || this.lost){
    return true;
  }
  return false;
}

Game2048.prototype.move = function(direction) {
  ion.sound.play("snap");
  if (!this._gameFinished()) {
    switch (direction) {
      case "up":
        boardChanged = this._moveUp();
        break;
      case "down":
        boardChanged = this._moveDown();
        break;
      case "left":
        boardChanged = this._moveLeft();
        break;
      case "right":
        boardChanged = this._moveRight();
        break;
    }

    if (boardChanged) {
      this._generateTile();
      this._isGameLost();
    }
  }
};

Game2048.prototype._isGameLost = function () {
  if (this._getAvailablePosition())
    return;

  var that   = this;
  var isLost = true;

  this.board.forEach(function (row, rowIndex) {
    row.forEach(function (cell, cellIndex) {
      var current = that.board[rowIndex][cellIndex];
      var top, bottom, left, right;

      if (that.board[rowIndex][cellIndex - 1]) {
        left  = that.board[rowIndex][cellIndex - 1];
      }
      if (that.board[rowIndex][cellIndex + 1]) {
        right = that.board[rowIndex][cellIndex + 1];
      }
      if (that.board[rowIndex - 1]) {
        top    = that.board[rowIndex - 1][cellIndex];
      }
      if (that.board[rowIndex + 1]) {
        bottom = that.board[rowIndex + 1][cellIndex];
      }

      if (current === top || current === bottom || current === left || current === right)
        isLost = false;
    });
  });

  this.lost = isLost;
};



var game;

window.onload = function () {
  game = new Game2048();
  renderTiles();
  loadSounds();
};

function renderTiles () {
  game.board.forEach(function(row, rowIndex){
    row.forEach(function (cell, cellIndex) {
      if (cell) {
        var tileContainer = document.getElementById("tile-container");
        var newTile       = document.createElement("div");

        newTile.classList  = "tile val-" + cell;
        newTile.classList += " tile-position-" + rowIndex + "-" + cellIndex;
        newTile.classList += " gameTile";
        newTile.innerHTML  = (cell);
        newTile.style.background = colorAssignment(cell);

        tileContainer.appendChild(newTile);
      }
    });
  });
}

function resetTiles () {
  var tilesContainer = document.getElementById("tile-container");
  var tiles          = tilesContainer.getElementsByClassName("gameTile");

  Array.prototype.slice.call(tiles).forEach(function (tile) {
    tilesContainer.removeChild(tile);
  });
}

function updateScore () {
  var score          = game.score;
  var scoreContainer = document.getElementsByClassName("js-score");

  Array.prototype.slice.call(scoreContainer).forEach(function (span) {
      span.innerHTML = score;
  });
}

function gameStatus () {
  if (game.win) {
    document.getElementById("game-over").classList = "show-won";
  } else if (game.lose) {
    document.getElementById("game-over").classList = "show-lost";
  }
}

function moveListeners (event) {

  switch (event.keyCode) {
    case 37: game.move("left");  break;
    case 38: game.move("up");    break;
    case 39: game.move("right"); break;
    case 40: game.move("down");  break;
    default: return;
  }

  resetTiles();
  renderTiles();
  updateScore();
  gameStatus();
};

function loadSounds () {
  ion.sound({
    sounds: [{name: "snap"}, {name: "tap"}],

    path: "/sounds/",
    preload: true,
    volume: 1.0
  });
}

document.addEventListener("keydown", moveListeners);
