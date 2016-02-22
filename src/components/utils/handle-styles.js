var HandleStyles = (function () {
  
  var merge = function () {
    var res = {};

    for (var i = 0; i < arguments.length; i++) {
      if (arguments[i]) {
        Object.assign(res, arguments[i]);
      }
    }

    return res;
  };

  return {
    merge: merge
  };

})();

module.exports = HandleStyles;