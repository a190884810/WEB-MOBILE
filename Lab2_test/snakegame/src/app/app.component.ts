import { Component } from '@angular/core';
import { BestScoreManager } from './score_storage.service';
import { CONTROLS, BOARD_SIZE } from './app.constants';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  host: {
    '(document:keydown)': 'handleKeyboardEvents($event)'
  }
})
export class AppComponent {
  private interval_grid: any;
  private temp_Direction: any;
  private game_mode = 'classic';
  private isGameOver = false;

  private getKeys = Object.keys;
  public board = [];
  public score = 0;
  public showChecker = false;
  public newBestScore = false;
  public best_score = this.best_score_service.retrieve();

  public snake={
    direction: CONTROLS.LEFT,
    parts: [
      {
        x: 0,
        y: 0
      }
    ]
  };

  private nut = {
    x:0,
    y:0
  };

  constructor (private best_score_service: BestScoreManager){
    this.reset();
  }

  handleKeyboardEvents(e: KeyboardEvent) {
    if (e.keyCode === CONTROLS.LEFT && this.snake.direction !== CONTROLS.RIGHT) {
      this.temp_Direction = CONTROLS.LEFT;
    } else if (e.keyCode === CONTROLS.UP && this.snake.direction !== CONTROLS.DOWN) {
      this.temp_Direction = CONTROLS.UP;
    } else if (e.keyCode === CONTROLS.RIGHT && this.snake.direction !== CONTROLS.LEFT) {
      this.temp_Direction = CONTROLS.RIGHT;
    } else if (e.keyCode === CONTROLS.DOWN && this.snake.direction !== CONTROLS.UP) {
      this.temp_Direction = CONTROLS.DOWN;
    }
  }

  updatePositions(): void {
    let newHead = this.repositionHead();
    let me = this;

    if (this.default_mode === 'classic' && this.boardCollision(newHead)) {
      return this.gameOver();
    }

    if (this.selfCollision(newHead)) {
      return this.gameOver();
    } else if (this.nutCollision(newHead)) {
      this.eatnut();
    }

    let oldTail = this.snake.parts.pop();
    this.board[oldTail.y][oldTail.x] = false;

    this.snake.parts.unshift(newHead);
    this.board[newHead.y][newHead.x] = true;

    this.snake.direction = this.temp_Direction;

    setTimeout(() => {
      me.updatePositions();
    }, this.interval_grid);
  }

  repositionHead(): any {
    let newHead = Object.assign({}, this.snake.parts[0]);

    if (this.temp_Direction === CONTROLS.LEFT) {
      newHead.x -= 1;
    } else if (this.temp_Direction === CONTROLS.RIGHT) {
      newHead.x += 1;
    } else if (this.temp_Direction === CONTROLS.UP) {
      newHead.y -= 1;
    } else if (this.temp_Direction === CONTROLS.DOWN) {
      newHead.y += 1;
    }

    return newHead;
  }

  selfCollision(part: any): boolean {
    return this.board[part.y][part.x] === true;
  }

  nutCollision(part: any): boolean {
    return part.x === this.nut.x && part.y === this.nut.y;
  }

  resetFruit(): void {
    let x = this.randomNumber();
    let y = this.randomNumber();

    if (this.board[y][x] === true ) {
      return this.resetFruit();
    }

    this.nut = {
      x: x,
      y: y
    };
  }

  eatFruit(): void {
    this.score++;

    let tail = Object.assign({}, this.snake.parts[this.snake.parts.length - 1]);

    this.snake.parts.push(tail);
    this.resetFruit();

    if (this.score % 5 === 0) {
      this.interval_grid -= 15;
    }
  }

  gameOver(): void {
    this.isGameOver = true;
    this.gameStarted = false;
    let me = this;

    if (this.score > this.best_score) {
      this.bestScoreService.store(this.score);
      this.best_score = this.score;
      this.newBestScore = true;
    }

    setTimeout(() => {
      me.isGameOver = false;
    }, 500);

    this.setBoard();
  }

  randomNumber(): any {
    return Math.floor(Math.random() * BOARD_SIZE);
  }

  setBoard(): void {
    this.board = [];

    for (let i = 0; i < BOARD_SIZE; i++) {
      this.board[i] = [];
      for (let j = 0; j < BOARD_SIZE; j++) {
        this.board[i][j] = false;
      }
    }
  }


}
