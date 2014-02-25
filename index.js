var Transform = require("./transform");
var IronMQ    = require("./ironmq_stream");
var core      = require("./core");
var PostProcessor = require("./postProcessor");

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
  return core.prepareComponent(options, source);
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
  return core.prepareComponent(options, store);
};

/*
  Transform:

  Available options

  onError:
*/
exports.Transform = function(options) {
  options = options || {};
  var transform = new Transform(options);
  return core.prepareComponent(options, transform);
};

exports.PostProcessor = function(options) {
  options = options || {};
  var postProcessor = new PostProcessor(options);
  return core.prepareComponent(options, postProcessor);
};
