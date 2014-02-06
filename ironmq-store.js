var IronMQ  = require("iron_mq");
var Stream  = require("stream");
var util    = require("util");

function IronSource(opts) {
  if(!this instanceof IronSource) {
    return new IronSource(opts);
  }
  var me = this;
  //setup client
  this.MQ = new IronMQ.Client({
    project_id: opts.projectId,
    token: opts.projectToken
  });
  this.__queue = new Queue(this, opts.queue);

  this.jobs = [];
  this._write = function(job) {
    job.success ? me.__queue.del(job) : me.__queue.release(job);
  };

  this._read = function() {
    me.__queue.resume();
    if(me.jobs.length) {
      //push each entry in jobs
      var ctr = 0;
      for(d in me.jobs) {
        if(!(this.push(d) && ctr++)) {
          //tell all queues to pause.
          me.__queue.pause();
          //remove already pushed jobs from our jobs length
          return me.jobs = me.jobs.slice(ctr);
        }
      }
      me.jobs = me.jobs.slice(ctr);
    }
  };


  function Queue(source, queueOpts) {
    this.__ironQueue = source.MQ.queue(queueOpts.name);
    this.__source = source;
    this.__opts = queueOpts;
  }

  Queue.prototype.resume = function() {
    var me = this;
    setInterval(function() {
      me.__ironQueue.get({}, function(error, messages) {
        if(error) return me.emit("error", error);
        if(!messages) return;
        messages = _.isArray(messages) ? messages : [messages]; 
        me.__source.jobs.concat(messages);
    }, this.__opts.checkEvery);
  };

  Queue.prototype.pause = function() {};
}



function IronStore() {}

util.inherits(IronSource, Stream.Duplex);
util.inherits(IronStore, Stream.Duplex);

exports.Source = IronSource;
exports.Store = IronStore;
