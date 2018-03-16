class bots {
  constructor() {
    this.queue = [];
    this.reincarnationCounter = 0;
  }

  addToQueue(message) {
    this.queue.push(message)

    if (this.reincarnationCounter) {
      while (this.reincarnationCounter--) {
        if (this.doSomeWork()); break;
      }
    }
  }

  startBotWorker() {
    this.doSomeWork();
    this.doSomeWork();
    this.doSomeWork();
  }

  doSomeWork() {
    if (this.queue.length === 0) {
      this.reincarnationCounter++;
      return true;
    }
    const message = this.queue.pop();
    setTimeout(() => {
      console.log('done with work', message);
      this.doSomeWork();
    }, 500)
  }
}

const myBots = new bots()

myBots.startBotWorker()
