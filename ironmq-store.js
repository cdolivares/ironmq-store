var IronMQ  = require("iron_mq");
var Stream  = require("stream");
var util    = require("util");
var _       = require("lodash");
var EventEmitter = require("events").EventEmitter;

util.inherits(IronSource, Stream.Duplex);
util.inherits(IronStore, Stream.Duplex);

function IronSource(opts) {
  Stream.Duplex.call(this);
  this.MQ = new IronMQ.Client({
    project_id: opts.projectId,
    token: opts.projectToken
  });
  this.__queue = new Queue(this, opts.queue);
}

IronSource.prototype._read = function() {
  this.__queue.resume();
  // console.log("READING!");
  // this.__queue.resume();
  // console.log("JOBS", this.jobs.length);
  // if(this.jobs.length) {
  //   //push each entry in jobs
  //   var ctr = 0;
  //   for(d in this.jobs) {
  //     if(!(this.push(d) && ctr++)) {
  //       //tell queue to pause.
  //       this.__queue.pause();
  //       //remove already pushed jobs from our jobs length
  //       return this.jobs = this.jobs.slice(ctr);
  //     }
  //   }
  //   this.jobs = this.jobs.slice(ctr);
  // }
};

IronSource.prototype._write = function(job) {
  job.success ? this.__queue.del(job) : this.__queue.release(job);
};

IronSource.prototype.start = function() {
  if(this.__queue) {
    this.__queue.resume();
  } else {}
};

IronSource.prototype.stop = function() {
  if(this.__queue) {
    this.__queue.pause();
  } else {}
};

function Queue(source, queueOpts) {
  this.__ironQueue = queueOpts.use ? queueOpts.use : source.MQ.queue(queueOpts.name);
  this.__source = source;
  this.__opts = queueOpts;
  EventEmitter.call(this);
}

Queue.prototype.resume = function() {
  var me = this;
  if(!this.__interval) {
    this.__interval = setInterval(function() {
      me.__ironQueue.get({}, function(error, messages) {
        if(error) return me.emit("error", error);
        if(!messages) return;
        messages = _.isArray(messages) ? messages : [messages]; 
        if(!me.__source.push(JSON.stringify({payload: messages}))) me.pause();
        if(!_.isEmpty(me.__source.listeners("iron-data"))) me.__source.emit("iron-data", messages);
      });
    }, this.__opts.checkEvery);
  }
};

Queue.prototype.pause = function() {
  if(this.__interval) {
    clearInterval(this.__interval);
    this.__interval = null;
  }
};



function IronStore(opts) {
  if(!this instanceof IronStore) {
    return new IronStore(opts);
  }

}

exports.Source = IronSource;
exports.Store = IronStore;
