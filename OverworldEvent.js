class OverworldEvent {
  constructor({ map, event }) {
    this.map = map;
    this.event = event;
    this.DoneStealAll =[];
  }

  stand(resolve) {
    const who = this.map.gameObjects[this.event.who];
    who.startBehavior({
      map: this.map
    }, {
      type: "stand",
      direction: this.event.direction,
      time: this.event.time
    })

    //Set up a handler to complete when correct person is done standing, then resolve the event
    const completeHandler = e => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonStandComplete", completeHandler);
        resolve();
      }
    }
    document.addEventListener("PersonStandComplete", completeHandler)
  }

  walk(resolve) {
    const who = this.map.gameObjects[this.event.who];
    who.startBehavior({
      map: this.map
    }, {
      type: "walk",
      direction: this.event.direction,
      retry: true
    })

    //Set up a handler to complete when correct person is done walking, then resolve the event
    const completeHandler = e => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonWalkingComplete", completeHandler);
        resolve();
      }
    }
    document.addEventListener("PersonWalkingComplete", completeHandler)
  }

  // Show the text event
  textMessage(resolve) {
    if (this.event.faceHero) {
      const obj = this.map.gameObjects[this.event.faceHero];
      obj.direction = utils.oppositeDirection(this.map.gameObjects["hero"].direction);
    }

    const message = new TextMessage({
      text: this.event.text,
      onComplete: () => resolve()
    })
    message.init(document.querySelector(".game-container"))
  }

  countdown(resolve) {
    const duration = this.event.duration;
    let remainingTime = duration / 1000; // Convert milliseconds to seconds
  
    const intervalId = setInterval(() => {
      if (remainingTime > 0) {
        console.log(`Stealing in progress... ${remainingTime}s left`); // Replace with actual text display logic
        const message = new TextMessage({
          text: `Stealing in progress... ${remainingTime}s left`,
          onComplete: () => {} // No resolve yet, just display the message
        });
        message.init(document.querySelector(".game-container"));
        remainingTime -= 1;
      } else {
        clearInterval(intervalId);
        const doneMessage = new TextMessage({
          text: "Done steal",
          onComplete: () => resolve() // Resolve after displaying "Done steal"
        });
        doneMessage.init(document.querySelector(".game-container"));
        DoneStealAll.push("stealAction");

      }

    }, 1000);
  }

  init() {
    return new Promise(resolve => {
      this[this.event.type](resolve)
    })
  }
}
