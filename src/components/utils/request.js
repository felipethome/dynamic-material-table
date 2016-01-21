var Request = (function () {
  
  var getContent = function (url) {
    return new Promise(function (resolve, reject) {
      var req = new XMLHttpRequest();
      req.open('GET', url);

      req.onload = function () {
        if (req.status === 200) {
          resolve(JSON.parse(req.response));
        }
        else {
          reject(Error(req.statusText));
        }
      };

      req.onerror = function () {
        reject(Error("Network error"));
      };

      req.send();
    });
  };

  return {
    getContent: getContent
  };

})();

module.exports = Request;