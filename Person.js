var DoneStealAll = [];

function endGame() {
  // document.getElementById("final-score").textContent = score;
  document.getElementById("game-end-screen").style.display = "block";
}

function restartGame() {

  document.getElementById("game-end-screen").style.display = "none";
  // Reset any other game elements or variables as needed
  location.reload();
}

function showWinScreen() {
  document.getElementById("game-win-screen").style.display = "block";
}

class Person extends GameObject {
  static IsEnemyReached = false;
  constructor(config) {
    super(config);
    this.movingProgressRemaining = 0;
    this.isPlayerControlled = config.isPlayerControlled || false;
    this.isStealDone1 = false; // New property to track steal action
    this.isStealDone2 = false; // New property to track steal action
    this.DoneStealAll = [];
    this.directionUpdate = {
      "up": ["y", -1],
      "down": ["y", 1],
      "left": ["x", -1],
      "right": ["x", 1],
    }
  }

  update(state) {
    if (DoneStealAll.length === 2) {
      showWinScreen();
      return;
    }
    if (this.movingProgressRemaining > 0) {
      this.updatePosition();
    } else {
      // Case: We're keyboard ready and have an arrow pressed
      if (!state.map.isCutscenePlaying && this.isPlayerControlled && state.arrow) {
        this.startBehavior(state, {
          type: "walk",
          direction: state.arrow
        });
        // Update player's location here
        utils.emitEvent("PlayerLocationUpdate", { x: this.x, y: this.y });
      }

      // Enemy behavior during a cutscene
      if (!this.isPlayerControlled && state.map.isCutscenePlaying) {
        const player = state.map.gameObjects["hero"];
        const targetX = player.x; // Set the target X position
        const targetY = player.y; // Set the target Y position (adjusted if needed)

        let tries = 0;

        if (!Person.IsEnemyReached) {
          while (tries < 50) {
            const dx = targetX - this.x;
            const dy = targetY - this.y;
            let direction = null;

            // Log target location and current location
            // console.log(`Target Location: (${targetX}, ${targetY})`);
            // console.log(`Enemy Current Location: (${this.x}, ${this.y})`);
            // console.log(`Player Current Location: (${player.x}, ${player.y})`);

            // Check if the next position will reach the target location
            const nextPos = utils.nextPosition(this.x, this.y, direction);
            if (nextPos.x === targetX) {
              break; // Enemy reached the target position, stop moving
            }

            // Determine primary and secondary direction
            const primaryDirection = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
            const secondaryDirection = primaryDirection === "right" || primaryDirection === "left" ? (dy > 0 ? "down" : "up") : (dx > 0 ? "right" : "left");

            // Try moving in the primary direction
            if (!state.map.isSpaceTaken(this.x, this.y, primaryDirection)) {
              direction = primaryDirection;
            } else if (!state.map.isSpaceTaken(this.x, this.y, secondaryDirection)) {
              // If primary direction is blocked, try the secondary direction
              direction = secondaryDirection;
            } else {
              // If both primary and secondary directions are blocked, try the remaining directions
              if (primaryDirection === "right" || primaryDirection === "left") {
                if (!state.map.isSpaceTaken(this.x, this.y, "up")) {
                  direction = "up";
                } else if (!state.map.isSpaceTaken(this.x, this.y, "down")) {
                  direction = "down";
                }
              } else {
                if (!state.map.isSpaceTaken(this.x, this.y, "right")) {
                  direction = "right";
                } else if (!state.map.isSpaceTaken(this.x, this.y, "left")) {
                  direction = "left";
                }
              }

              if (!direction) {
                // If all directions are blocked, increment tries and continue
                tries++;
                console.log(`Try ${tries}: All directions are blocked from (${this.x}, ${this.y})`);
                continue;
              }
            }

            // console.log(`Try ${tries}: Moving ${direction} from (${this.x}, ${this.y})`);

            if (nextPos.x === targetX + 16) {
              // this.startBehavior(state, {
              //   type: "walk",
              //   direction: "up",
              // });

              this.startBehavior(state, {
                type: "stand",
                direction: "left",
              });
              console.log(`I AM IN`)
              Person.IsEnemyReached = true;
              endGame();
              break;
            }
            else {
              console.log("NextPosition" + nextPos.x);
              console.log("TargetPosition" + targetX);
              this.startBehavior(state, {
                type: "walk",
                direction: direction
              });
            }

            utils.emitEvent("EnemyLocationUpdate", { x: this.x, y: this.y });

            // Increment the tries counter only after a valid move
            tries++;

            // Break the loop if the enemy moves, to allow the behavior to complete before the next update
            break;
          }



        }
      }
    }

    this.updateSprite(state);
  }

  startBehavior(state, behavior) {
    //Set character direction to whatever behavior has
    this.direction = behavior.direction;

    if (behavior.type === "walk") {
      //Stop here if space is not free
      if (state.map.isSpaceTaken(this.x, this.y, this.direction)) {

        behavior.retry && setTimeout(() => {
          this.startBehavior(state, behavior)
        }, 10);

        return;
      }

      //Ready to walk!
      state.map.moveWall(this.x, this.y, this.direction);
      this.movingProgressRemaining = 16;
      this.updateSprite(state);
    }

    if (behavior.type === "stand") {
      setTimeout(() => {
        utils.emitEvent("PersonStandComplete", {
          whoId: this.id
        })
      }, behavior.time)
    }

  }

  updatePosition() {
    const [property, change] = this.directionUpdate[this.direction];
    this[property] += change;
    this.movingProgressRemaining -= 1;

    if (this.movingProgressRemaining === 0) {
      //We finished the walk!
      utils.emitEvent("PersonWalkingComplete", {
        whoId: this.id
      })

      // Update player's location here
      // For example, you can emit a custom event to notify other parts of your code about the new location
      utils.emitEvent("PlayerLocationUpdate", { x: this.x, y: this.y });

    }
  }

  updateSprite() {
    if (this.movingProgressRemaining > 0) {
      this.sprite.setAnimation("walk-" + this.direction);
      return;
    }
    this.sprite.setAnimation("idle-" + this.direction);
  }

}