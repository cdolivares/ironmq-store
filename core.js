// Stream Core. To be factored out of this repo.

exports.prepareComponent = function(options, component) {
  var onError = options.onError || function(err) {
    console.error("--------------");
    console.error(err.message);
    console.error(JSON.stringify(err.job, null, 4));
    console.error("--------------");
  };
  component.on("error", onError);
  return component;
};

exports.setError = function(message, job)  {
  var err = new Error(message);
  err.job = job;
  return err;
};
