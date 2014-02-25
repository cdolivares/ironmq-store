var Transform = require("./transform");
var IronMQ    = require("./ironmq_stream");
var core      = require("./core");
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
  return core.prepareComponent(source);
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
  return core.prepareComponent(store);
};

/*
  Transform:

  Available options

  onError:
*/
exports.Transform = function(options) {
  options = options || {};
  var transform = new Transform(options);
  return core.prepareComponent(transform);
};
