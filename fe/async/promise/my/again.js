const STATUS = {
  pending: 0,
  resolved: 1,
  rejected: -1
};

function NOOP() {}

function resolve(promise, val) {
  promise.status = STATUS.resolved;
  promise.value = val;
  promise.list.forEach(({ onResolve }) => {
    fireCb(onResolve);
  });
}

function reject(promise, val) {
  promise.status = STATUS.rejected;
  promise.value = val;
  promise.list.forEach(({ onReject }) => {
    fireCb(onReject);
  });
}

function fireCb(cb, value, nextPromise) {
  setTimeout(function() {
    try {
      let retVal = cb(value);
      if (retVal instanceof Promise) {
        retVal.then(
          function(v) {
            resolve(nextPromise, v);
          },
          function(v) {
            reject(nextPromise, v);
          }
        );
      } else {
        resolve(nextPromise, retVal);
      }
    } catch (e) {
      nextPromise._reject(e);
    }
  });
}

function Promise(fn) {
  // 判断

  // this

  this.status = STATUS.pending;
  this.list = [];
  var that = this;

  function _resolve(val) {
    resolve(that, val);
  }

  function _reject(val) {
    that.status = STATUS.rejected;
    that.value = val;
    reject(that, val);
  }

  try {
    fn.call(this, _resolve, _reject);
  } catch (e) {
    reject(e);
  }
}

Promise.prototype.then = function(onResolve = NOOP, onReject = NOOP) {
  // 是否是函数
  var that = this;

  var promise = new Promise(function() {});

  if (this.status === STATUS.pending) {
    this.list.push({
      onResolve,
      onReject
    });
  } else {
    this.status === STATUS.resolved ? fireCb(onResolve, this.value, promise) : fireCb(onReject, this.value, promise);
  }

  return promise;
};
