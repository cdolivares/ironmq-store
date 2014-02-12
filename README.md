## ironmq-store (wip)


```javascript
var IronmqSource = require("ironmq-store").Source;
var source = IronmqSource({
  projectId: "projectId",
  projectToken: "projectToken",
  queue: {
    name: "JobQueue",
    checkEvery: 10, //in ms
    maxMessagesPerEvent: 5
  }
});

//testing
var IronmqSource = require("ironmq-store").Source;
var source = IronmqSource({
  projectId: "projectId",
  projectToken: "projectToken",
  queue: {
    use: SomeQueueObject
  }
});
```
