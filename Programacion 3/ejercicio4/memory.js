class Card {
    constructor(name, img) {
        this.name = name;
        this.img = img;
        this.isFlipped = false;
        this.element = this.#createCardElement();
    }

    #createCardElement() {
        const cardElement = document.createElement("div");
        cardElement.classList.add("cell");
        cardElement.innerHTML = `
            <div class="card" data-name="${this.name}">
                <div class="card-inner">
                    <div class="card-front"></div>
                    <div class="card-back">
                        <img src="${this.img}" alt="${this.name}">
                    </div>
                </div>
            </div>
        `;
        return cardElement;
    }

    toggleFlip() {
        this.isFlipped = !this.isFlipped;
        if (this.isFlipped) {
            this.#flip();
        } else {
            this.#unflip();
        }
    }

    matches(otherCard) {
        return this.name === otherCard.name;
    }

    #flip() {
        const cardElement = this.element.querySelector(".card");
        cardElement.classList.add("flipped");
    }

    #unflip() {
        const cardElement = this.element.querySelector(".card");
        cardElement.classList.remove("flipped");
    }
}

class Board {
    constructor(cards) {
        this.cards = cards;
        this.fixedGridElement = document.querySelector(".fixed-grid");
        this.gameBoardElement = document.getElementById("game-board");
    }

    #calculateColumns() {
        const numCards = this.cards.length;
        let columns = Math.floor(numCards / 2);

        columns = Math.max(2, Math.min(columns, 12));

        if (columns % 2 !== 0) {
            columns = columns === 11 ? 12 : columns - 1;
        }

        return columns;
    }

    #setGridColumns() {
        const columns = this.#calculateColumns();
        this.fixedGridElement.className = `fixed-grid has-${columns}-cols`;
    }

    render() {
        this.#setGridColumns();
        this.gameBoardElement.innerHTML = "";
        this.cards.forEach((card) => {
            card.element
                .querySelector(".card")
                .addEventListener("click", () => this.onCardClicked(card));
            this.gameBoardElement.appendChild(card.element);
        });
    }

    shuffleCards() {
        this.cards = this.cards.sort(() => 0.5 - Math.random());
    }

    reset() {
        this.shuffleCards();
        this.cards.forEach(card => {
            if (card.isFlipped) {
                card.toggleFlip();
            }
        });
        this.render();
    }

    flipDownAllCards() {
        this.cards.forEach(card => {
            if (card.isFlipped) {
                card.toggleFlip();
            }
        });
    }

    onCardClicked(card) {
        if (this.onCardClick) {
            this.onCardClick(card);
        }
    }
}

class MemoryGame {
    constructor(board, flipDuration = 500) {
        this.board = board;
        this.flippedCards = [];
        this.matchedCards = [];
        this.flipDuration = flipDuration;
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;

        this.board.onCardClick = this.#handleCardClick.bind(this);
        this.resetGame();
    }

    #handleCardClick(card) {
        if (this.flippedCards.length < 2 && !card.isFlipped) {
            card.toggleFlip();
            this.flippedCards.push(card);
            this.moves++;
            document.getElementById("move-counter").textContent = `Movimientos: ${this.moves}`;

            if (this.flippedCards.length === 2) {
                setTimeout(() => this.checkForMatch(), this.flipDuration);
            }
        }
    }

    checkForMatch() {
        const [card1, card2] = this.flippedCards;
        if (card1.matches(card2)) {
            this.matchedCards.push(card1, card2);
            this.flippedCards = [];
            if (this.matchedCards.length === this.board.cards.length) {
                clearInterval(this.timerInterval);
                alert(`¡Has ganado! Movimientos: ${this.moves}, Tiempo: ${this.timer}s`);
            }
        } else {
            setTimeout(() => {
                card1.toggleFlip();
                card2.toggleFlip();
                this.flippedCards = [];
            }, this.flipDuration);
        }
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            document.getElementById("timer").textContent = `Tiempo: ${this.timer}s`;
        }, 1000);
    }

    resetGame() {
        this.matchedCards = [];
        this.flippedCards = [];
        this.moves = 0;
        this.timer = 0;
        clearInterval(this.timerInterval);
        document.getElementById("move-counter").textContent = "Movimientos: 0";
        document.getElementById("timer").textContent = "Tiempo: 0s";
        this.board.reset();
        this.startTimer();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const cardsData = [
        { name: "Python", img: "./img/Python.svg" },
        { name: "JavaScript", img: "./img/JS.svg" },
        { name: "Java", img: "./img/Java.svg" },
        { name: "CSharp", img: "./img/CSharp.svg" },
        { name: "Go", img: "./img/Go.svg" },
        { name: "Ruby", img: "./img/Ruby.svg" },
    ];

    const cards = cardsData.flatMap((data) => [
        new Card(data.name, data.img),
        new Card(data.name, data.img),
    ]);
    const board = new Board(cards);
    const memoryGame = new MemoryGame(board, 1000);

    document.getElementById("restart-button").addEventListener("click", () => {
        memoryGame.resetGame();
    });
});
