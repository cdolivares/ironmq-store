var IronSource = require("./").Source;
var IronClientStub = require("./stub").Client;
var JobTransform = require("./").Transform;
var expect = require('expect.js');
var stream = require("stream");
var equal = require("deep-equal");
var _ = require("lodash");

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
        },
        {
          body: {job: "three"}
        },
        {
          body: {job: "four"}
        }
      ];
      queue.setMessages(messages);
      consumer = IronSource({
        project_id: "someProject",
        token: "someToken",
        queue: {
          checkEvery: 1000,
          maxMessagesPerEvent: 2,
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
      var writable = stream.Writable({objectMode: true});
      writable._write = function(data, enc, next) {
        expect(data).to.be.an(Object);
        consumer.unpipe(writable);
        return done();
      };
      consumer.pipe(writable);
    });

    it("should return at most the specified number of messages in `opts.maxMessagesPerEvent`", function(done) {
      var writable = stream.Writable({objectMode: true});
      writable._write = function(data, enc, next) {
        expect(data).to.be.an(Array);
        expect(data).to.have.length(2); //testing stub always returns the specified number.
        consumer.unpipe(writable);
        return done();
      };
      consumer.pipe(writable);
    });
  });

  describe("Store", function() {

  });

});

describe("Transform", function() {
  var ironJob;
  beforeEach(function(done) {
    ironJob = {
      id: "5981845182215737219",
      body: "",
      timeout: 60,
      reserved_count: 309,
      push_status: {}
    }
    done();
  });

  it("should transform a properly formatted job", function(done) {
    var expectedJobFromTransform = {
      id: "5981845182215737219",
      service: "test",
      action: "action",
      payload: {
        some: "data"
      }
    };
    ironJob.body = JSON.stringify(_.omit(expectedJobFromTransform, "id"));
    var readable = stream.Readable({objectMode: true});
    var transformer = JobTransform();
    var jobs = [ironJob];
    readable._read = function() {
      this.push(jobs.shift());
    };
    var writable = stream.Writable({objectMode: true, decodeStrings: false});
    writable._write = function(obj, enc, next) {
      expect(equal(obj, expectedJobFromTransform)).to.be(true);
      readable.unpipe(transformer);
      transformer.unpipe(writable);
      done();
    };
    readable.pipe(transformer).pipe(writable);
  });

  it("should error if the body cannot be JSON parsed", function(done) {
    var badJson = '{"bad": "json"';
    ironJob.body = badJson;
    var readable = stream.Readable({objectMode: true});
    var jobs = [ironJob];
    readable._read = function() {
      this.push(jobs.shift());
    };
    var options = {
      onError: function(error) {
        expect(error.message).to.contain("Unexpected");
        readable.unpipe(transformer);
        done();
      }
    };
    var transformer = JobTransform(options);
    readable.pipe(transformer);
  });

  it("should error if the json object is not the properly formatted job", function(done) {
    var badJob = '{"formatted": "job"}';
    ironJob.body = badJob;
    var readable = stream.Readable({objectMode: true});
    var jobs = [ironJob];
    readable._read = function() {
      this.push(jobs.shift());
    };
    var options = {
      onError: function(error) {
        expect(error.message).to.contain("Unrecognized");
        readable.unpipe(transformer);
        done();
      }
    };
    var transformer = JobTransform(options);
    readable.pipe(transformer);
  });
});

describe("postProcessor", function() {
  
});




