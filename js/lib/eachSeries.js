// Generated by CoffeeScript 1.12.2
(function() {
  var eachSeries, makePromise;

  makePromise = require("make-promise");

  module.exports = eachSeries = function(values, iterator, options) {
    var i;
    if (options == null) {
      options = {};
    }
    i = 0;
    return makePromise(function(cb) {
      var iterate, resolver;
      resolver = function(i) {
        return function(result) {
          if (typeof options.handleResult === "function") {
            options.handleResult(result, i);
          }
          return iterate();
        };
      };
      iterate = function() {
        var err, error, promise;
        if ((i >= values.length) || (typeof options.stopEarly === "function" ? options.stopEarly() : void 0)) {
          return cb(null, typeof options.getFinalValue === "function" ? options.getFinalValue() : void 0);
        } else {
          try {
            promise = iterator(values[i]);
          } catch (error1) {
            err = error1;
            return cb(err);
          }
          try {
            promise.then(resolver(i)).then(null, function(err) {
              return cb(err);
            });
          } catch (error1) {
            error = error1;
            cb(error);
          }
          return i++;
        }
      };
      return iterate();
    });
  };

}).call(this);

//# sourceMappingURL=eachSeries.js.map
