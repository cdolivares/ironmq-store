/*
  All jobs into the post processor must have the format:

  {
    id: "uniqueId",
    service: "",
    action: "",
    payload: {}
  }

  job.id must exist and must map to a unique job currently in the store.
*/

var stream = require("stream");
var util = require("util");
var IronMQ  = require("iron_mq");
var _       = require("lodash");
var core    = require("./core");
util.inherits(IronmqPostProcessor, stream.Transform);

/*
  @param opts {Object}
    opts. {String}
    opts.projectToken {String}
    opts.queue {Object}
      opts.queue.name {String}
*/

function IronmqPostProcessor(opts) {
  stream.Transform.call(this, {objectMode: true, decodeStrings: false});
  this.__opts = opts;
  if(opts.queue.use) {
    this.__queue = opts.queue.use;
  } else {
    var MQ = new IronMQ.Client({
      project_id: opts.projectId,
      token: opts.projectToken
    });
    this.__queue = MQ.queue(opts.queue.name)
  }
}

//Successful jobs piped here
IronmqPostProcessor.prototype._transform = function(job, enc, next) {
  //validate job format
  var err;
  var me = this;
  if(!(job.id)) {
    err = new Error("Unrecognized job format");
    err.job = job;
    return next(err);
  }
  if(this.__opts.onSuccess) {
    this.__opts.onSuccess(job, function(err) {
      if(err) {
        err.job = job;
        return next(err);
      }
      this.push(job);
      next();
    });
  } else {
    this.__queue.del(job.id, function(err) {
      if(err) {
        err.job = job;
        return next(err);
      }
      me.push(job); //mirror success through
      next();
    });
  }
}

module.exports = IronmqPostProcessor;
