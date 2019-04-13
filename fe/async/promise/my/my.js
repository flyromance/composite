/*
Promise#then
Promise#catch
Promise.resolve
Promise.reject
Promise.all
Promise.race
*/

(function(g, factory) {
  if (module && module.exports) {
    module.exports = factory(g);
  } else if (typeof define === "function") {
    define(function() {
      return factory(g);
    });
  } else {
    var _Promise = g.Promise;

    var Promise$ = factory(g);

    Promise$.noConflict = function() {
      g.Promise = _Promise;
      return Promise$;
    };

    g.Promise = Promise$;
  }
})(this, function(g) {
  const STATUS = {
    pending: 0,
    resolved: 1,
    rejected: -1
  };

  function NOOP() {}

  function isFunction(fn) {
    return typeof fn === "function";
  }

  function isArray(arr) {
    return Object.prototype.toString.call(arr) === "[object Array]";
  }

  function doResolve(self, value) {
    // 如果返回的是promise对象
    if (value instanceof Promise) {
      value.then(
        function(val) {
          doResolve(self, val);
        },
        function(err) {
          doReject(self, err);
        }
      );
    } else {
      self.value = value;
      self.status = STATUS.resolved;
      self.queue.forEach(function(item) {
        item.callResolve(value);
      });
    }
  }

  function doReject(self, err) {
    self.value = err;
    self.status = STATUS.rejected;
    self.queue.forEach(function(item) {
      item.callReject(err);
    });
  }

  function fireItem(nextPromise, func, value) {
    setTimeout(function() {
      var retValue;
      try {
        retValue = func(value);
      } catch (err) {
        doReject(nextPromise, err);
        return; // 注意！！！
      }

      if (retValue === nextPromise) {
        throw new Error("return value must not be same as promise");
      } else {
        doResolve(nextPromise, retValue);
      }
    });
  }

  /*
   * @param fn {Function}
   * @return {Promise}
   */
  function Promise(fn) {
    if (!(this instanceof Promise)) {
      throw new Error("Promise must be called with new");
    }

    if (!isFunction(fn)) {
      throw new Error("Promise resolver must be function");
    }

    this.queue = [];
    this.status = STATUS.pending;
    // this.value;
    var that = this;

    function resolve(val) {
      doResolve(that, val);
    }

    function reject(err) {
      doReject(that, err);
    }

    try {
      fn(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  /*
   * @param onResolve {Function}
   * @param onReject {Function}
   * @return {Promise}
   */
  Promise.prototype.then = function(onResolve, onReject) {
    // 如果不是函数，并且状态已经不是pending
    if (
      (!isFunction(onResolve) && this.status === STATUS.resolved) ||
      (!isFunction(onReject) && this.status === STATUS.rejected)
    ) {
      return this;
    }

    var promise = new this.constructor(function() {});

    if (this.status === STATUS.pending) {
      this.queue.push({
        callResolve: function(val) {
          fireItem(promise, onResolve, val);
        },
        callReject: function(err) {
          fireItem(promise, onReject, err);
        }
      });
    } else {
      this.status === STATUS.resolved
        ? fireItem(promise, onResolve, this.value)
        : fireItem(promise, onReject, this.value);
    }

    return promise;
  };

  /*
   * @param arr {Array}
   * @param onReject {Function}
   * @return {Promise}
   */
  Promise.prototype.catch = function(onReject) {
    return this.then(null, onReject);
  };

  /*
   * @param onResolve {Function}
   * @return {undefined}
   */
  Promise.prototype.done = function(onResolve) {};

  /*
   * @param val {any type}
   * @return {Promise}
   */
  Promise.resolve = function(val) {
    return new Promise(function(resolve, reject) {
      resolve(val);
    });
  };

  /*
   * @param val {any type}
   * @return {Promise}
   */
  Promise.reject = function(val) {
    return new Promise(function(resolve, reject) {
      reject(val);
    });
  };

  /*
   * @param arr {Array}
   * @return {Promise}
   * arr里的只要有一个是rejected，直接执行then回调里的onReject
   * 如果没有rejected，则执行onResolve,
   */
  Promise.all = function(arr) {
    if (!isArray(arr)) {
      throw new Error("Promise all arguments must be array");
    }

    var total = arr.length;

    if (total === 0) {
      return Promise.resolve([]);
    }

    var result_reject = [];
    var result = new Array(total);
    var isCalled = false;

    var promise = new Promise(function(resolve, reject) {
      function check() {
        if (isCalled) return;
        if (result_reject.length) {
          isCalled = true;
          reject(result_reject[0]);
        } else {
          if (total < 1) {
            isCalled = true;
            resolve(result);
          }
        }
      }

      arr.forEach(function(item, i) {
        if (item instanceof Promise) {
          item.then(
            function(val) {
              total--;
              result[i] = val;
              check();
            },
            function(err) {
              total--;
              result_reject.push(err);
              check();
            }
          );
        } else {
          total--;
          result[i] = item;
          check();
        }
      });
    });

    return promise;
  };

  /*
   * @param arr {Array}
   * @return {Promise}
   */
  Promise.race = function(arr) {
    if (!isArray(arr)) {
      throw new Error("Promise.all arguments must be array");
    }
    var isCalled = false;

    return new Promise(function(resolve, reject) {
      arr.forEach(function(item, i) {
        if (item instanceof Promise) {
          item.then(
            function(val) {
              if (!isCalled) {
                isCalled = true;
                resolve(val);
              }
            },
            function(val) {
              if (!isCalled) {
                isCalled = true;
                reject(val);
              }
            }
          );
        } else {
          if (!isCalled) {
            isCalled = true;
            resolve(item);
            return false;
          }
        }
      });
    });
  };

  return Promise;
});
