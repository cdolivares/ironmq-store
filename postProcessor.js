/*
  All data into the post processor has the format:

  {
    processingStatus: "success|failure",
    details: "",
    job: {}
  }

  job.id must exist and must map to a unique job currently in the store.
*/

var stream = require("stream");
var util = require("util");
var IronMQ  = require("iron_mq");
var _       = require("lodash");
utils.inherits(IronmqPostProcessor, stream.Transform);

/*
  @param opts {Object}
    opts.projectId {String}
    opts.projectToken {String}
    opts.queue {Object}
      opts.queue.name {String}

  opts.onFailure and opts.onSuccess are optional.
  Default onSuccess is to delete the job from the queue.
  Default onFailure is to do nothing, in which case the job
  will be retried after some period.
*/

function IronmqPostProcessor(opts) {
  stream.Transform.call(this, {objectMode: true, decodeStrings: false});
  this.__opts = opts;
  this.MQ = new IronMQ.Client({
    project_id: opts.projectId,
    token: opts.projectToken
  });
  this.__queue = this.MQ.queue(opts.queue.name);
}

//Successful jobs piped here
IronmqPostProcessor.prototype._transform = function(job, enc, next) {
  //validate job format
  var err;
  if(!(job.id)) {
    err = new Error("Unrecognized job format");
    err.job = job;
    return next(error);
  }
  if(this.opts.onSuccess) {
    this.opts.onSuccess(job, function(err) {
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
      this.push(job); //mirror success through
      next();
    });
  }
}

//Expects err to have an err.job property.
IronmqPostProcessor.prototype.onErrorHandler = function(err) {
  var job = err.job;
  if(!job) {
    //what to do.
  }
  if(this.onFailure) {
    this.onFailure.call(this, job);
  }
}

/*
  options {Object}
    options.onError {Function} - optional Error handler
    options.projectId {String}
    options.projectToken {String}
    options.queue {Object}
      options.queue.name {String}

*/
module.exports = function(options) {
  var p = new IronmqPostProcessor(options);
  options.onError = options.onError || function(error) {
    console.error("--------------")
    console.error(error.message);
    console.error(JSON.stringify(error.job, null, 4));
    console.error("--------------")
  };
  p.on("error", options.onError);
  return p;
}
