var makeCancelable = function (promise) {
  var hasCanceled_ = false;

  return {
    promise: new Promise(
      function (resolve, reject) {
        promise
          .then(function (r) {
            hasCanceled_
              ? reject({isCanceled: true})
              : resolve(r);
          });
      }
    ),
    cancel: function () {
      hasCanceled_ = true;
    },
  };
};

module.exports = makeCancelable;