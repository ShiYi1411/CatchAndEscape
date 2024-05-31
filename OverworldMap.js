class OverworldMap {
  constructor(config) {
    this.gameObjects = config.gameObjects;
    this.cutSceneSpaces =config.cutSceneSpaces||{};
    this.walls = config.walls || {};

    this.fullImage = new Image();
    this.fullImage.src = config.fullSrc;

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.isCutscenePlaying = false;
    this.hunterArrived = false;
  }

  drawFullImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.fullImage,
      utils.withGrid(10.5) - cameraPerson.x,
      utils.withGrid(6) - cameraPerson.y
    )
  }

  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.lowerImage,
      utils.withGrid(10.5) - cameraPerson.x,
      utils.withGrid(6) - cameraPerson.y
    )
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage,
      utils.withGrid(10.5) - cameraPerson.x,
      utils.withGrid(6) - cameraPerson.y
    )
  }

  isSpaceTaken(currentX, currentY, direction) {
    const { x, y } = utils.nextPosition(currentX, currentY, direction);
    return this.walls[`${x},${y}`] || false;
  }

  mountObjects() {
    Object.keys(this.gameObjects).forEach(key => {

      let object = this.gameObjects[key];
      object.id = key;

      //TODO: determine if this object should actually mount
      object.mount(this);

    })
  }

  async startCutscene(events) {
    this.isCutscenePlaying = true;

    for (let i = 0; i < events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      })
      await eventHandler.init();
    }

    this.isCutscenePlaying = false;
  }

  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find(object => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
    });
    if (!this.isCutscenePlaying && match && match.talking.length) {
      this.startCutscene(match.talking[0].events);
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutSceneSpaces[`${hero.x},${hero.y}`];
    if(!this.isCutscenePlaying&&match){
      this.startCutscene(match[0].events)
    }
  }

  addWall(x, y) {
    this.walls[`${x},${y}`] = true;
  }
  removeWall(x, y) {
    delete this.walls[`${x},${y}`]
  }
  moveWall(wasX, wasY, direction) {
    this.removeWall(wasX, wasY);
    const { x, y } = utils.nextPosition(wasX, wasY, direction);
    this.addWall(x, y);
  }

}

window.OverworldMaps = {
  DemoRoom: {
    fullSrc: "/images/maps/StreetLower.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(10),
        y: utils.withGrid(12),
        // x: utils.withGrid(5),
        // y: utils.withGrid(10),
        src: "/images/characters/people/npc1.png",
      }),
      hunter: new Person({
        x: utils.withGrid(20),
        y: utils.withGrid(9),
        src: "/images/characters/people/npc3.png",
        behaviorLoop: [
          { type: "stand",  direction: "up",time:500 },  
          { type: "walk",  direction: "up" }, 
          { type: "walk", direction: "left" },  
          { type: "walk",  direction: "left" }, 
          { type: "walk",  direction: "left" }, 
          { type: "walk",  direction: "left" },
          { type: "walk",  direction: "left" },
          { type: "walk",  direction: "down" },
          { type: "walk",  direction: "down" },
          { type: "walk",  direction: "down" },
          { type: "walk",  direction: "down" },
          { type: "walk",  direction: "right" },
          { type: "walk",  direction: "right" },
          { type: "walk",  direction: "right" },     
          { type: "walk",  direction: "right" },
          { type: "walk",  direction: "right" },
          { type: "walk",  direction: "right" },
          { type: "walk",  direction: "right" },
          { type: "walk",  direction: "right" },     
          { type: "walk",  direction: "right" },
          { type: "walk",  direction: "right" },
          { type: "walk",  direction: "right" },
          { type: "walk",  direction: "right" },
          { type: "walk",  direction: "up" }, 
          { type: "walk",  direction: "up" }, 
          { type: "walk",  direction: "up" }, 
          { type: "walk",  direction: "up" }, 
          { type: "walk",  direction: "left" }, 
          { type: "walk",  direction: "left" }, 
          { type: "walk",  direction: "left" },
          { type: "walk",  direction: "left" },
          { type: "walk",  direction: "left" }, 
          { type: "walk",  direction: "left" }, 
          { type: "walk",  direction: "left" },
          { type: "walk",  direction: "down" },
        
        ],
        // talking: [
        //   {
        //     events: [
        //       { type: "textMessage", text: "You get caught..", faceHero: "npcA" },
        //       { type: "textMessage", text: "Don't steal anything"},
        //     ]
        //   }
        // ]
      }),
    },

    walls: function () {
      let walls = {};
      ["4,9", "5,8", "6,9", "7,9", "8,9", "9,9", "10,9", "11,9", "12,9", "13,8", "14,8", "15,7",
        "16,7", "17,7", "18,7", "19,7", "20,7", "21,7", "22,7", "23,7", "24,7", "24,6", "24,5", "26,5", "26,6", "26,7", "27,7", "28,8", "28,9", "29,8", "30,9", "31,9", "32,9", "33,9",
        "16,9", "17,9", "25,9", "26,9", "16,10", "17,10", "25,10", "26,10", "16,11", "17,11", "25,11", "26,11",
        "18,11", "19,11",
        "4,14", "5,14", "6,14", "7,14", "8,14", "9,14", "10,14", "11,14", "12,14", "13,14", "14,14", "15,14", "16,14", "17,14", "18,14", "19,14", "20,14", "21,14", "22,14", "23,14",
        "24,14", "25,14", "26,14", "27,14", "28,14", "29,14", "30,14", "31,14", "32,14", "33,14",
        "3,10", "3,11", "3,12", "3,13", "34,10", "34,11", "34,12", "34,13",
        "29,8", "25,4",
      ].forEach(coord => {
        let [x, y] = coord.split(",");
        walls[utils.asGridCoord(x, y)] = true;
      })
      return walls;
    }(),

    cutSceneSpaces:{
      [utils.asGridCoord(5,9)]:[
        {
          events:[
            { type: "countdown", duration: 5000 },
          ]
        }
      ],
      [utils.asGridCoord(29,9)]:[
        {
          events:[
            { type: "countdown", duration: 5000 },
          ]
        }
      ]
    }
  },

}