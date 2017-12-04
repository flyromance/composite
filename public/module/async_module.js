(function () {
  var moduleCache = {}
    , F = {}
    , config = {
      baseUrl: './',
    };

  Array.isArray = Array.isArray ? Array.isArray : function (arr) {
    return Object.prototype.toString.call(arr).slice(8, -1).toLowerCase() === 'array'
  }

  function mixin(target, source) {
    for (var key in source) {
      target[key] = source[key];
    }
  }

  F.config = function (conf, value) {
    if (typeof conf === 'string') {
      config[conf] = value;
    } else if (typeof conf === 'object') {
      mixin(config, conf);
    }
  }

  function getCurrentUrl() {
    var head = document.getElementsByTagName('head')[0],
      scripts = head.getElementsByTagName('script'),
      lens = scripts.length,
      script = scripts[lens - 1];
    return script.src;
  }

  function getModId(id) {
    var ret = ''
      , baseUrl = config.baseUrl;

    if (baseUrl == '.' || baseUrl == '') {
      baseUrl = './'
    }
    // /my/lib/  确保路径最后一个字符是/
    baseUrl = baseUrl.replace(/\/$/, '') + '/';

    if (baseUrl == './') {
      config.baseUrl = baseUrl = location.pathname.replace(/\/[^\/]*$/, '') + '/';
    }

    id = id.replace(/\.js$/, '');

    // 绝对路径
    if (id.charAt(0) == '/' || /^(https?:\/\/|\/)/.test(id)) {
      ret = id;
    } else if (id.indexOf('./') === 0) {
      ret = baseUrl + id.replace(/^\./, '');
    } else if (id.indexOf('../') === 0) { // ../../a.js  
      baseUrl = baseUrl.replace(/\/$/, ''); // /my/lib or .
      ret = id.replace(/\.\.\//g, function () {
        var index = baseUrl.lastIndexOf('/');
        baseUrl = baseUrl.slice(0, index);
        return ''
      });
      ret = baseUrl + id;
    } else {
      ret = baseUrl + id;
    }

    return ret
  }

  function formatUrl(url) {
    return url.replace(/\.js$/g, '') + '.js'
  }

  function loadScript(url) {
    var script = document.createElement('script');
    script.async = true;
    script.type = 'text/javascript';
    script.charset = 'UTF-8';
    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);
  }

  // 三种情况
  function loadModule(id, callback) {
    var modMap = getModMap(id);

    if (modMap.status === 'loaded') {
      setTimeout(callback(modMap.exports));
    } else if (modMap.status === 'loading') {
      modMap.onload.push(callback)
    } else if (modMap.status === 'init') {
      modMap.status = 'loading';
      modMap.onload.push(callback);
      loadScript(formatUrl(modMap.id));
    }
  }

  // 设置模块完成
  function setModule(modName) {
    var modMap = getModMap(modName)
      , fn
      , depExports = []
      , depMod;

    for (var i = 0; i < modMap.deps.length; i++) {
      depMod = getModMap(modMap.deps[0])
      depExports.push(depMod.exports)
    }

    modMap.status = 'loaded';
    modMap.exports = factory.call(modMap, depExports);
    while (fn = modMap.onload.shift()) {
      fn(modMap.exports)
    }
  }

  function getModMap(name) {
    var id = getModId(name)
    var map = moduleCache[id] || {
      status: 'init',
      exports: {},
      id: id,
      onload: []
    };
    return moduleCache[id] = map;
  }

  // 默认是 string array function
  F.define = function (modName, deps, factory) {
    if (typeof modName === 'function') { // F.define(function() {})
      factory = modName;
      deps = [];
      modName = null;
    }

    if (typeof deps === 'function') {
      if (typeof modName === 'string') { // F.define('xxx', function() {})
        factory = deps;
        deps = [];
      } else if (Array.isArray(modName)) { // F.define([], function() {})
        factory = deps;
        deps = modName;
        modName = null;
      } else {
        throw new Error('arg error.')
      }
    }

    if (!modName) {
      modName = getCurrentUrl();
      modName = getModId(modName);
    }

    if (!Array.isArray(deps)) {
      throw new Error('arg error, deps must be array')
    }

    if (typeof factory !== 'function') {
      throw new Error('arg error, factory must be function')
    }

    var lens = deps.length
      , leftCount = lens
      , params = [];

    var modMap = getModMap(modName);
    modMap.deps = deps;
    modMap.factory = factory;

    if (lens) {
      for (var i = 0; i < lens; i++) {
        (function (i) {
          loadModule(deps[i], function () {
            if (--leftCount === 0) {
              setModule(modName);
            }
          });
        })(i);
      }
    } else {
      setModule(modName);
    }
  }

  // 主入口模块
  F.use = function (deps, factory) {
    F.define('mod_' + new Date().getTime(), deps, factory);
  }

  window.F = F;
})(window);