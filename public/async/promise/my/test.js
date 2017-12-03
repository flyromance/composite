Promise = (function () {

  function Promise(handler) {
    var self = this;
    self.status = 'pending';
    self.resolveList = [];
    self.rejectList = [];

    function fire() {
      if (self.status == 'resolved') {
        var list = self.resolveList
      } else {
        list = self.rejectList
      }
      list.forEach(function (handler) {
        try {
          var ret = handler.call(self, self.val)
        } catch (e) {
          self._reject && self._reject();
          return;
        }
        if (ret instanceof Promise) {
          ret.then(function (val) {
            self._resolve(val)
          }, function (val) {
            self._reject(val)
          })
        } else {
          self._resolve(ret)
        }
      })
    }

    function resolve(val) {
      self.status = status = 'resolved';
      self.val = val;
      setTimeout(fire);
    }

    function reject(val) {
      self.status = status = 'rejected'
      self.val = val;
      setTimeout(fire);
    }

    try {
      handler.apply(self, [resolve, reject]);
    } catch (e) {
      reject(e)
    }

    return self;
  }

  Promise.prototype.then = function (resolver, rejecter) {
    var self = this;

    if (self.status === 'pending') {
      self.resolveList.push(resolver);
      self.rejectList.push(rejecter);
    } else if (self.status === 'resolved') {
      setTimeout(function () {
        try {
          var ret = resolver.call(self, self.val)
        } catch (e) {
          self._reject && self._reject();
          return;
        }
        if (ret instanceof Promise) {
          ret.then(function (val) {
            self._resolve(val)
          }, function (val) {
            self._reject(val)
          })
        } else {
          self._resolve(ret)
        }
      })
    } else {
      setTimeout(function () {
        try {
          var ret = rejecter.call(self, self.val)
        } catch (e) {
          self._reject && self._reject();
          return;
        }
        if (ret instanceof Promise) {
          ret.then(function (val) {
            self._resolve(val)
          }, function (val) {
            self._reject(val)
          })
        } else {
          self._resolve(ret)
        }
      })
    }


    var promise = new Promise(function (resolve, reject) {
      self._reject = function (val) {
        reject(val)
      }

      self._resolve = function (val) {
        resolve(val)
      }
    });

    return promise
  }

  Promise.prototype.catch = function (rejecter) {
    return this.then(null, rejecter)
  }

  Promise.all = function () {

  }

  Promise.race = function () {

  }

  Promise.resolve = function () {

  }

  Promise.reject = function () {

  }

  return Promise
})()

