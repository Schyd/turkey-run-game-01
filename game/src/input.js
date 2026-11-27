// Gobble Dash — keyboard and mouse input.
// One job: turn keys and clicks into game actions, nothing else.

export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.jumpPressed = false;
    this.actionPressed = false;
    this.pausePressed = false;
    this.clicked = false;
    this.clickX = 0;
    this.clickY = 0;
    this.canvas = canvas;

    window.addEventListener('keydown', (event) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
        event.preventDefault();
      }
      if (!event.repeat) {
        this.keys.add(event.code);
        if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') {
          this.jumpPressed = true;
        }
        if (event.code === 'Enter' || event.code === 'KeyR') {
          this.actionPressed = true;
        }
        if (event.code === 'KeyP' || event.code === 'Escape') {
          this.pausePressed = true;
        }
      }
    });
    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.code);
    });
    canvas.addEventListener('pointerdown', (event) => {
      const rect = canvas.getBoundingClientRect();
      this.clicked = true;
      this.clickX = ((event.clientX - rect.left) / rect.width) * canvas.width;
      this.clickY = ((event.clientY - rect.top) / rect.height) * canvas.height;
      this.jumpPressed = true;
    });
    window.addEventListener('blur', () => this.keys.clear());
  }

  isDown(code) {
    return this.keys.has(code);
  }

  get jump() {
    return this.isDown('Space') || this.isDown('ArrowUp') || this.isDown('KeyW');
  }

  get hide() {
    return this.isDown('ArrowDown') || this.isDown('KeyS');
  }

  get dash() {
    return this.isDown('ShiftLeft') || this.isDown('ShiftRight');
  }

  get startKey() {
    return this.isDown('Enter') || this.isDown('Space');
  }

  get restartKey() {
    return this.isDown('KeyR') || this.isDown('Enter') || this.isDown('Space');
  }

  get pauseKey() {
    return this.isDown('KeyP') || this.isDown('Escape');
  }

  get muteKey() {
    return this.isDown('KeyM');
  }

  // Edge-triggered: true once per press, then cleared by the game.
  consumeJump() {
    const pressed = this.jumpPressed;
    this.jumpPressed = false;
    return pressed;
  }

  consumeAction() {
    const pressed = this.actionPressed;
    this.actionPressed = false;
    return pressed;
  }

  consumePause() {
    const pressed = this.pausePressed;
    this.pausePressed = false;
    return pressed;
  }

  consumeClick() {
    const clicked = this.clicked;
    this.clicked = false;
    return clicked ? { x: this.clickX, y: this.clickY } : null;
  }

  clearEdges() {
    this.jumpPressed = false;
    this.actionPressed = false;
    this.pausePressed = false;
    this.clicked = false;
  }
}
