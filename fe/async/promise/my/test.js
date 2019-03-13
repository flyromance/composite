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
          var ret = handler && handler.call(self, self.val)
        } catch (e) {
          self._reject && self._reject(e);
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
      if (self.status !== 'pending') return;
      self.status = status = 'resolved';
      self.val = val;
      setTimeout(fire);
    }

    function reject(val) {
      if (self.status !== 'pending') return;      
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
      self.resolveList.push(resolver)
      self.rejectList.push(rejecter)
    } else if (self.status === 'resolved') {
      self.resolveList.push(resolver);
    } else {
      self.rejectList.push(rejecter);
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

  Promise.all = function (arr) {
    if (!Array.isArray(arr)) throw new Error('must be array');
    var _reject, _resolve, vals = [], stop = false;

    for (var i = 0, lens = arr.length, leftLens = lens; i < lens; i++) {
      if (stop) break;
      (function (i) {
        var val = arr[0];
        if (val instanceof Promise) {
          val.then(function (val) {
            cb(val, i)
          }, function (val) {
            stop = true
            _reject(val)
          })
        } else {
          cb(val, i)
        }
      })(i);
    }

    function cb(val, i) {
      vals[i] = val;
      if (--leftLens === 0) {
        setTimeout(function () {
          _resolve(vals)
        });
      }
    }

    var promise = new Promise(function (resolve, reject) {
      _resolve = function (val) {
        resolve(val)
      }

      _reject = function (val) {
        reject(val)
      }
    })

    return promise
  }

  Promise.race = function (arr) {
    if (!Array.isArray(arr)) throw new Error('must be array');
    var _reject, _resolve, vals = [];

    for (var i = 0, lens = arr.length; i < lens; i++) {
      var val = arr[0];
      if (val instanceof Promise) {
        val.then(function (val) {
          _resolve && _resolve(val);
          _resolve = null;
        }, function (val) {
          _reject && _reject(val)
          _reject = null;
        })
      } else {
        setTimeout(function () {
          _resolve(val)
        })
        break;
      }
    }

    var promise = new Promise(function (resolve, reject) {
      _resolve = function (val) {
        resolve(val)
      }

      _reject = function (val) {
        reject(val)
      }
    })

    return promise
  }

  Promise.resolve = function () {

  }

  Promise.reject = function () {

  }

  return Promise
})()

