class SlidingPuzzle {
    constructor() {
        this.grid = document.getElementById('puzzle-grid');
        this.moveCounter = document.getElementById('move-counter');
        this.resetButton = document.getElementById('reset-button');
        this.congratsMessage = document.getElementById('congrats-message');
        this.finalMoves = document.getElementById('final-moves');
        this.playAgainButton = document.getElementById('play-again');
        this.timerDisplay = document.getElementById('timer');
        this.finalTimeDisplay = document.getElementById('final-time');
        this.difficultyButtons = document.querySelectorAll('.difficulty-btn');
        this.instructionModal = document.getElementById('instruction-modal');
        this.startGameButton = document.getElementById('start-game');
        
        this.tiles = [];
        this.emptyIndex = 8;
        this.moves = 0;
        this.isPlaying = true;
        this.currentSize = 3;
        this.timer = 0;
        this.timerInterval = null;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.startGameButton.addEventListener('click', () => {
            this.instructionModal.style.display = 'none';
            this.initializeGame();
        });

        this.resetButton.addEventListener('click', () => {
            this.resetGame();
        });

        this.playAgainButton.addEventListener('click', () => {
            this.resetGame();
        });

        this.difficultyButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.difficultyButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.currentSize = parseInt(button.dataset.size);
                this.resetGame();
            });
        });
    }

    initializeGame() {
        // Create tiles array with numbers 1 to (size*size - 1) and empty space
        const totalTiles = this.currentSize * this.currentSize;
        this.tiles = Array.from({ length: totalTiles - 1 }, (_, i) => i + 1);
        this.tiles.push(null); // Add empty space
        
        this.shuffleTiles();
        this.renderTiles();
        this.updateMoveCounter();
        this.startTimer();
    }

    startTimer() {
        this.timer = 0;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    shuffleTiles() {
        // Fisher-Yates shuffle algorithm
        for (let i = this.tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
        }

        // Ensure the puzzle is solvable
        let inversions = 0;
        for (let i = 0; i < this.tiles.length - 1; i++) {
            if (this.tiles[i] !== null) {
                for (let j = i + 1; j < this.tiles.length; j++) {
                    if (this.tiles[j] !== null && this.tiles[i] > this.tiles[j]) {
                        inversions++;
                    }
                }
            }
        }

        // If puzzle is not solvable, swap two tiles to make it solvable
        if (inversions % 2 !== 0) {
            const firstTile = this.tiles.findIndex(tile => tile !== null);
            const secondTile = this.tiles.findIndex((tile, index) => tile !== null && index > firstTile);
            [this.tiles[firstTile], this.tiles[secondTile]] = [this.tiles[secondTile], this.tiles[firstTile]];
        }

        // Find empty space index
        this.emptyIndex = this.tiles.indexOf(null);
    }

    renderTiles() {
        this.grid.innerHTML = '';
        this.grid.style.gridTemplateColumns = `repeat(${this.currentSize}, 1fr)`;
        this.grid.style.gridTemplateRows = `repeat(${this.currentSize}, 1fr)`;
        
        this.tiles.forEach((tile, index) => {
            const tileElement = document.createElement('div');
            tileElement.className = `puzzle-tile ${tile === null ? 'empty' : ''}`;
            tileElement.textContent = tile || '';
            tileElement.dataset.index = index;
            
            // Add animation for tile appearance
            tileElement.style.animation = 'fadeIn 0.3s ease-out';
            
            tileElement.addEventListener('click', () => {
                if (!this.isPlaying) return;
                if (this.isAdjacentToEmpty(index)) {
                    this.moveTile(index);
                }
            });
            
            this.grid.appendChild(tileElement);
        });
    }

    updateMoveCounter() {
        this.moveCounter.textContent = this.moves;
    }

    isAdjacentToEmpty(index) {
        const row = Math.floor(index / this.currentSize);
        const col = index % this.currentSize;
        const emptyRow = Math.floor(this.emptyIndex / this.currentSize);
        const emptyCol = this.emptyIndex % this.currentSize;

        return (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
               (Math.abs(col - emptyCol) === 1 && row === emptyRow);
    }

    moveTile(index) {
        // Add moving animation class to the tile being moved
        const tileElement = this.grid.children[index];
        tileElement.classList.add('moving');
        
        // Remove the animation class after it completes
        setTimeout(() => {
            tileElement.classList.remove('moving');
        }, 300);

        // Swap tiles
        [this.tiles[this.emptyIndex], this.tiles[index]] = [this.tiles[index], this.tiles[this.emptyIndex]];
        this.emptyIndex = index;
        this.moves++;
        this.updateMoveCounter();
        this.renderTiles();

        if (this.checkWin()) {
            this.handleWin();
        }
    }

    checkWin() {
        return this.tiles.every((tile, index) => {
            if (index === this.tiles.length - 1) return tile === null;
            return tile === index + 1;
        });
    }

    handleWin() {
        this.isPlaying = false;
        clearInterval(this.timerInterval);
        this.finalMoves.textContent = this.moves;
        this.finalTimeDisplay.textContent = this.timerDisplay.textContent;
        this.congratsMessage.classList.remove('hidden');
    }

    resetGame() {
        this.moves = 0;
        this.isPlaying = true;
        this.congratsMessage.classList.add('hidden');
        this.initializeGame();
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new SlidingPuzzle();
}); 