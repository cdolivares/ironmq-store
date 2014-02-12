var IronStore = require("./ironmq-store").Source;
var IronClientStub = require("./stub").Client;
var expect = require('expect.js');

describe("IronStore", function() {
  var consumer;
  before(function(done) {
    var stub = new IronClientStub({project_id: "someProject", token: "someToken"});
    var queue = stub.queue("test");
    var messages = [
      {
        body: {job: "one"}
      },
      {
        body: {job: "two"}
      }
    ];
    queue.setMessages(messages);
    consumer = new IronStore({
      project_id: "someProject",
      token: "someToken",
      queue: {
        checkEvery: 1000,
        maxMessagesPerEvent: 1,
        use: queue //for testing
      }
    });
    done();
  });

  describe("Source", function() {
    it("should create emit events at the specified interval", function(done) {
      var consumedData = [];
      var numMessages = 0;
      consumer.on("iron-data", function(data) {
        consumedData.push(data);
      });

      setInterval(function() {
        expect(consumedData).to.have.length(numMessages);
        if(numMessages == 2) {
          return done();
        }
        numMessages++;
      }, 700); //offset works for two ticks
      consumer.start();
    });
  });

  describe("Store", function() {

  });

});

