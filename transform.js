var Transform = require("stream").Transform;

/*
  Transformer
*/

module.exports = function(options) {
  options = options || {};
  var transform = Transform({
    objectMode: true,
    decodeStrings: false
  });

  transform._transform = function(obj, encoding, next) {
    var error;
    var body = obj.body;
    try {
      body = JSON.parse(body);
    } catch(e) {
      e.job = obj;
      return next(e);
    }
    /* 
      Job's must have the format:

      {
        id: "",
        service: "",
        action: "",
        payload: ""
      }

      `id` must be unique.
    */
    if(!(body.service && body.action && body.payload)) {
      error = new Error("Unrecognized job format");
      error.job = obj;
      return next(error);
    }
    if(!obj.id) {
      error = new Error("Job does not have a unique id");
      error.job = obj;
      return next(error);
    }
    body.id = obj.id;
    this.push(body);
    next();
  };
  return transform;
};

