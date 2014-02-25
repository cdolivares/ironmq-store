// Stream Core. To be factored out of this repo.

exports.prepareComponent = function(component) {
  if(!component.listeners("error")) {
    component.on("error", function() {
      console.error("--------------");
      console.error(err.message);
      console.error(JSON.stringify(err.job, null, 4));
      console.error("--------------");
    });
  }
  return component;
};


exports.setError = function(message, job)  {
  var err = new Error(message);
  err.job = job;
  return err;
};
