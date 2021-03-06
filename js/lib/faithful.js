// Generated by CoffeeScript 1.12.2
(function() {
  var faithful, fn, i, len, mod, name, ref;

  module.exports = faithful = {
    adapt: require("./adapt"),
    each: require("./each"),
    forEach: require("./each"),
    eachSeries: require("./eachSeries"),
    forEachSeries: require("./eachSeries"),
    eachLimit: require("./eachLimit"),
    forEachLimit: require("./eachLimit"),
    adapt: require("./adapt"),
    makePromise: require("make-promise"),
    collect: require("./collect"),
    throwHard: require("./throwHard")
  };

  ref = [require("./utilities"), require("./collections"), require("./flow-control")];
  for (i = 0, len = ref.length; i < len; i++) {
    mod = ref[i];
    for (name in mod) {
      fn = mod[name];
      faithful[name] = fn;
    }
  }

}).call(this);

//# sourceMappingURL=faithful.js.map
