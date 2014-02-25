var Transform = require("./transform");
var IronMQ    = require("./ironmq_stream");

/*
  Source:

  Available options.

  onError:
  projectId:
  projectToken:
  queue:
    name:
    checkEvery:
    maxMessagesPerEvent:
*/
exports.Source = function(options) {
  options = options || {};
  var source = new IronMQ.Source(options);
  var onError = options.onError || function(err) {
    console.error("--------------");
    console.error(err.message);
    console.error(JSON.stringify(err.job, null, 4));
    console.error("--------------");
  };
  source.on("error", onError);
  return source;
};

/*
  Store:

  Available options

  onError:
  projectId:
  projectToken:
  queue:
    name:
    checkEvery:
    maxMessagesPerEvent:
*/
exports.Store = function(options) {
  options = options || {};
  var store = new IronMQ.Store(options);
  var onError = options.onError || function(err) {
    console.error("--------------");
    console.error(err.message);
    console.error(JSON.stringify(err.job, null, 4));
    console.error("--------------");
  };
  return store;
};

/*
  Transform:

  Available options

  onError:
*/
exports.Transform = function(options) {
  options = options || {};
  var transform = new Transform(options);
  var onError = options.onError || function(err) {
    console.error("--------------");
    console.error(err.message);
    console.error(JSON.stringify(err.job, null, 4));
    console.error("--------------");
  };
  return transform;
};
