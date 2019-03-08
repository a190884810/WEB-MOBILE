import { Component } from '@angular/core';
import { BestScoreManager } from './app.storage.service';
import { CONTROLS, COLORS, BOARD_SIZE, GAME_MODES } from './app.constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  host: {
    '(document:keydown)': 'handleKeyboardEvents($event)'
  }
})
export class AppComponent {
  private interval: number;
  private tempDirection: number;
  private DEFAULT_MODE = 'classic';
  private isGameOver = false;

  public ALL_MODES = GAME_MODES;
  public getKeys = Object.keys;
  public board = [];
  public obstacles = [];
  public score = 0;
  public showMenuChecker = false;
  public gameStarted = false;
  public newBestScore = false;
  public topScore = this.bestScoreService.retrieve();

  private snake = {
    direction: CONTROLS.LEFT,
    parts: [
      {
        x: -1,
        y: -1
      }
    ]
  };

  private apple = {
    x: -1,
    y: -1
  };

  isApple(x: number, y: number) {
    return (x === this.apple.x && y === this.apple.y);
  }

  constructor(
    private bestScoreService: BestScoreManager
  ) {
    this.setGameBoard();
  }

  setColors(col: number, row: number): string {
    if (this.isGameOver) {
      return COLORS.GAME_OVER;
    } else if (this.apple.x === row && this.apple.y === col) {
      return COLORS.APPLE;
    } else if (this.snake.parts[0].x === row && this.snake.parts[0].y === col) {
      return COLORS.HEAD;
    } else if (this.board[col][row] === true) {
      return COLORS.BODY;
    } else if (this.DEFAULT_MODE === 'obstacles' && this.checkObstacles(row, col)) {
      return COLORS.OBSTACLE;
    }
    return COLORS.BOARD;
  }

  handleKeyboardEvents(e: KeyboardEvent) {
    if (e.keyCode === CONTROLS.LEFT && this.snake.direction !== CONTROLS.RIGHT) {
      this.tempDirection = CONTROLS.LEFT;
    } else if (e.keyCode === CONTROLS.UP && this.snake.direction !== CONTROLS.DOWN) {
      this.tempDirection = CONTROLS.UP;
    } else if (e.keyCode === CONTROLS.RIGHT && this.snake.direction !== CONTROLS.LEFT) {
      this.tempDirection = CONTROLS.RIGHT;
    } else if (e.keyCode === CONTROLS.DOWN && this.snake.direction !== CONTROLS.UP) {
      this.tempDirection = CONTROLS.DOWN;
    }
  }

  updateLocation(): void {
    const newHead = this.repositionHead();
    const me = this;

    if (this.DEFAULT_MODE === 'classic' && this.boardCollision(newHead)) {
      return this.gameOver();
    } else if (this.DEFAULT_MODE === 'no_walls') {
      this.noWallsTransition(newHead);
    } else if (this.DEFAULT_MODE === 'obstacles') {
      this.noWallsTransition(newHead);
      if (this.obstacleCollision(newHead)) {
        return this.gameOver();
      }
    }

    if (this.selfCollision(newHead)) {
      return this.gameOver();
    } else if (this.appleCollision(newHead)) {
      this.eatApple();
    }

    const oldTail = this.snake.parts.pop();
    this.board[oldTail.y][oldTail.x] = false;

    this.snake.parts.unshift(newHead);
    this.board[newHead.y][newHead.x] = true;

    this.snake.direction = this.tempDirection;

    setTimeout(() => {
      me.updateLocation();
    }, this.interval);
  }

  repositionHead(): any {
    const newHead = Object.assign({}, this.snake.parts[0]);

    if (this.tempDirection === CONTROLS.LEFT) {
      newHead.x -= 1;
    } else if (this.tempDirection === CONTROLS.RIGHT) {
      newHead.x += 1;
    } else if (this.tempDirection === CONTROLS.UP) {
      newHead.y -= 1;
    } else if (this.tempDirection === CONTROLS.DOWN) {
      newHead.y += 1;
    }

    return newHead;
  }

  noWallsTransition(part: any): void {
    if (part.x === BOARD_SIZE) {
      part.x = 0;
    } else if (part.x === -1) {
      part.x = BOARD_SIZE - 1;
    }

    if (part.y === BOARD_SIZE) {
      part.y = 0;
    } else if (part.y === -1) {
      part.y = BOARD_SIZE - 1;
    }
  }

  addObstacles(): void {
    const x = this.randomNumber();
    const y = this.randomNumber();

    if (this.board[y][x] === true || y === 8) {
      return this.addObstacles();
    }

    this.obstacles.push(x, y);
  }

  checkObstacles(x, y): boolean {
    let res = false;

    this.obstacles.forEach((obst) => {
      if (obst.x === x && obst.y === y) {
        res = true;
      }
    });

    return res;
  }

  obstacleCollision(part: any): boolean {
    return this.checkObstacles(part.x, part.y);
  }

  boardCollision(part: any): boolean {
    return part.x === BOARD_SIZE || part.x === -1 || part.y === BOARD_SIZE || part.y === -1;
  }

  selfCollision(part: any): boolean {
    return this.board[part.y][part.x] === true;
  }

  appleCollision(part: any): boolean {
    return part.x === this.apple.x && part.y === this.apple.y;
  }

  resetApple(): void {
    const x = this.randomNumber();
    const y = this.randomNumber();

    if (this.board[y][x] === true || this.checkObstacles(x, y)) {
      return this.resetApple();
    }

    this.apple = {
      x,
      y
    };
  }

  eatApple(): void {
    this.score++;

    const tail = Object.assign({}, this.snake.parts[this.snake.parts.length - 1]);

    this.snake.parts.push(tail);
    this.resetApple();

    if (this.score % 5 === 0) {
      this.interval -= 15;
    }
  }

  gameOver(): void {
    this.isGameOver = true;
    this.gameStarted = false;
    const session = this;

    if (this.score > this.topScore) {
      this.bestScoreService.store(this.score);
      this.topScore = this.score;
      this.newBestScore = true;
    }

    setTimeout(() => {
      session.isGameOver = false;
    }, 900);

    this.setGameBoard();
  }

  randomNumber(): any {
    return Math.floor(Math.random() * BOARD_SIZE);
  }

  setGameBoard(): void {
    this.board = [];

    for (let i = 0; i < BOARD_SIZE; i++) {
      this.board[i] = [];
      for (let j = 0; j < BOARD_SIZE; j++) {
        this.board[i][j] = false;
      }
    }
  }

  showMenu(): void {
    this.showMenuChecker = !this.showMenuChecker;
  }

  newGame(mode: string): void {
    this.DEFAULT_MODE = mode || 'classic';
    this.showMenuChecker = false;
    this.newBestScore = false;
    this.gameStarted = true;
    this.score = 0;
    this.tempDirection = CONTROLS.LEFT;
    this.isGameOver = false;
    this.interval = 150;
    this.snake = {
      direction: CONTROLS.LEFT,
      parts: []
    };

    for (let i = 0; i < 3; i++) {
      this.snake.parts.push({ x: 8 + i, y: 8 });
    }

    if (mode === 'obstacles') {
      this.obstacles = [];
      let j = 1;
      do {
        this.addObstacles();
      } while (j++ < 9);
    }

    this.resetApple();
    this.updateLocation();
  }
}
