var IronSource = require("./ironmq-store").Source;
var IronClientStub = require("./stub").Client;
var expect = require('expect.js');
var stream = require("stream");

describe("IronStore", function() {
  describe("Source", function() {
      var consumer;
      beforeEach(function(done) {
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
        consumer = new IronSource({
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

      afterEach(function(done) {
        consumer.stop();
        done();
      });


    it("should create emit events at the specified interval", function(done) {
      var consumedData = [];
      var numMessages = 0;
      consumer.on("iron-data", function(data) {
        consumedData.push(data);
      });

      var i = setInterval(function() {
        expect(consumedData).to.have.length(numMessages);
        if(numMessages == 2) {
          clearInterval(i);
          return done();
        }
        numMessages++;
      }, 700); //offset works for two ticks
      consumer.start();
    });

    it("should properly pipe data through to a writable stream", function(done) {
      var writable = stream.Writable();
      writable._write = function(data, enc, next) {
        expect(data).to.be.an(Object);
        return done();
      };
      consumer.pipe(writable);
    });
  });

  describe("Store", function() {

  });

});

