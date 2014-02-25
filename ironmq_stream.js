var IronMQ  = require("iron_mq");
var Stream  = require("stream");
var util    = require("util");
var Transform = require("./transform");
var _       = require("lodash");
var EventEmitter = require("events").EventEmitter;

util.inherits(IronSource, Stream.Duplex);
util.inherits(IronStore, Stream.Duplex);


/*
  @param opts {Object}
    opts.projectId {String}
    opts.projectToken {String}
    opts.queue {Object}
      opts.queue.name {String}
      opts.queue.checkEvery {Number} in ms.
      opts.queue.maxMessagesPerEvent {Number}
*/
function IronSource(opts) {
  Stream.Duplex.call(this, {objectMode: true, decodeStrings: false});
  this.__queue = new Queue(this, opts);
}

IronSource.prototype._read = function() {
  this.__queue.resume();
};

IronSource.prototype._write = function(job, enc, next) {
  job.success ? this.__queue.del(job) : this.__queue.release(job);
  next();
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

function Queue(source, opts) {
  if(opts.queue.use) {
    this.__ironQueue = opts.queue.use;
  } else {
    var MQ = new IronMQ.Client({
      project_id: opts.projectId,
      token: opts.projectToken
    });
    this.__ironQueue = MQ.queue(opts.queue.name);
  }
  this.__source = source;
  this.__opts = opts;
  EventEmitter.call(this);
}

Queue.prototype.resume = function() {
  var me = this;
  if(!this.__interval) {
    this.__interval = setInterval(function() {
      me.__ironQueue.get({n: me.__opts.queue.maxMessagesPerEvent}, function(error, messages) {
        if(error) return me.emit("error", error);
        if(!messages) return;
        messages = _.isArray(messages) ? messages : [messages]; 
        if(!me.__source.push(messages)) me.pause();
        if(!_.isEmpty(me.__source.listeners("iron-data"))) me.__source.emit("iron-data", messages);
      });
    }, this.__opts.queue.checkEvery);
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
