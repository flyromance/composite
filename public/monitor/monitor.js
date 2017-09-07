/**
 * 统计代码
 * author : 远古时期的某人[战毅]、曜子、屈屈、李成银（本版维护:lichengyin@360.cn）
 * update :
 * v1.4.0 (2016.01.04) 支持更多的参数，类似 Google 统计，支持热力图
 * v1.3.2 (2014.04.30) 修改 count Cookie 名为 monitor_count
 * v1.3.1 (2013.11.20) 增加对 IE11 版本号的判断
 * v1.3.0 (2013.08.14) 引入了巨东的bk机制，解决了新增汇总板块需要修改setId的麻烦
 * v1.2.8 (2013.07.31) 针对几个新域名做了处理，_guid这个cookie都放在根域下
 * v1.2.7 (2013.04.27) 更改monitor名称为QIHOO_MONITOR_COMMON，页面无其他monitor时，monitor==QIHOO_MONITOR_COMMON
 * v1.2.6 (2013.01.30) 增加对button和input type=button|submit 两种元素的统计
 * v1.2.5 (2012.12.21) 修改点击统计为mousedown时发请求，减少原页面跳转后统计不到的情况
 */
(function() {
  //如果window下已经有QIHOO_MONITOR_COMMON，不做任何事情
  if (typeof window.QIHOO_MONITOR_COMMON !== 'undefined') {
    return;
  }

  var 
    version = 'v1.4.0 (2016.01.04)',

    //设置__guid这个cookie存放域，如果为空，就保存在页面当前域，如果为"360.cn"，cookie会被设置到".360.cn"，依此类推
    guidCookieDomains = ['360.cn', 'so.com', 'leidian.com', 'btime.com'];

  var QIHOO_MONITOR_COMMON = (function(window, undefined) {
    var isLocal;
    //有时候monitor.js会在file://或者res://协议下使用，判断下
    (function() {
      isLocal = true;
      try {
        var protocol = location.protocol.toLowerCase();
        if (protocol == 'http:' || protocol == 'https:') {
          isLocal = false;
        }
      } catch (e) {}
    })();

    var 
      doc = document,
      nav = window.navigator,
      screen = window.screen,

      // 默认是子域名，如：item.btime.com
      domain = isLocal ? '' : document.domain.toLowerCase(),
      ua = nav.userAgent.toLowerCase();

    var StringH = {
      trim: function(s) {
        return s.replace(/^[\s\xa0\u3000]+|[\u3000\xa0\s]+$/g, "");
      }
    };
    /**
     * Element相关方法
     * @type {Object}
     */
    var NodeH = {
      on: function(el, type, fn) {
        if (el.addEventListener) {
          el && el.addEventListener(type, fn, false);
        } else {
          el && el.attachEvent('on' + type, fn);
        }
      },
      parentNode: function(el, tagName, deep) {
        deep = deep || 5;
        tagName = tagName.toUpperCase();
        while (el && deep-- > 0) {
          if (el.tagName === tagName) {
            return el;
          }
          el = el.parentNode;
        }
        return null;
      }
    };

    /**
     * Event相关方法
     * @type {Object}
     */
    var EventH = {
      fix: function(e) {
        if (!('target' in e)) {
          var node = e.srcElement || e.target;
          if (node && node.nodeType == 3) {
            node = node.parentNode;
          }
          e.target = node;
        }
        return e;
      }
    };

    /**
     * Object相关方法
     * @type {Object}
     */
    var ObjectH = (function() {
      function getConstructorName(o) {
        //加o.constructor是因为IE下的window和document
        if (o != null && o.constructor != null) {
          return Object.prototype.toString.call(o).slice(8, -1);
        } else {
          return '';
        }
      }

      return {
        /**
         * 判断一个变量是否Array对象
         * @param  {Object}  obj 目标变量
         * @return {Boolean}
         */
        isArray: function(obj) {
          return getConstructorName(obj) == 'Array';
        },

        /**
         * 判断一个变量是否typeof object
         * @param  {Object}  obj 目标变量
         * @return {Boolean}
         */
        isObject: function(obj) {
          return obj !== null && typeof obj == 'object';
        },

        /**
         * 将源对象的属性并入到目标对象
         * @param  {Object} des      目标对象
         * @param  {Object} src      源对象，如果是数组，则依次并入
         * @param  {Boolean} override 是否覆盖已有属性
         * @return {Object}          des
         */
        mix: function(des, src, override) {
          for (var i in src) {
            // 这里要加一个des[i]，是因为要照顾一些不可枚举的属性
            // TODO: Object.assign 是不可枚举的，但是 'assign' in Object 是true
            // override为true，强制覆盖目标对象的属性
            // override不为true，目标对象没有声明过的属性才能被覆盖
            // 目标对象obj.name = undefined，源对象obj.name = 12, 目标对象属性undefined也不能被覆盖...
            // jquery的规则是：目标对象属性类型为undefined就能被覆盖
            if (override || !(des[i] || (i in des))) {
              des[i] = src[i];
            }
          }
          return des;
        },

        /**
         * 将Object序列化为key=val键值对字符串，不处理val为数组的情况
         * @param  {Object} json 需要序列化的对象
         * @return {String}      序列化后的字符串
         */
        encodeURIJson: function(obj) {
          var result = [];
          for (var p in obj) {
            if (obj[p] == null) continue;
            result.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
          }
          return result.join('&');
        }
      };
    })();

    /**
     * Cookie读写操作的封装
     * @type {Object}
     */
    var Cookie = {
      get: function(key) {
        try {
          var a, reg = new RegExp("(^| )" + key + "=([^;]*)(;|$)");
          if (a = doc.cookie.match(reg)) {
            return unescape(a[2]);
          } else {
            return "";
          }
        } catch (e) {
          return "";
        }
      },
      set: function(key, val, options) {
        options = options || {};
        var expires = options.expires;

        if (typeof(expires) === "number") {
          expires = new Date();
          expires.setTime(expires.getTime() + options.expires);
        }

        try {
          doc.cookie =
            key + "=" + escape(val) + (expires ? ";expires=" + expires.toGMTString() : "") + (options.path ? ";path=" + options.path : "") + (options.domain ? "; domain=" + options.domain : "");
        } catch (e) {}
      }
    };

    /**
     * 工具集，用来获取具体项目的值
     * 可通过QIHOO_MONITOR_COMMON.util.[方法名]来访问
     * 增加或覆盖这里的方法，可以实现更多功能
     * @type {Object}
     */
    var util = {
      getColorDepth: function() {
        return screen.colorDepth + '-bit'; // 24
      },
      /**
       * 获取语言 zh-CN
       * @return {[type]} [description]
       */
      getLanguage: function() {
        return (nav.language || nav.browserLanguage).toLowerCase();
      },
      /**
       * 获取屏幕大小 1920X1080
       * @return {[type]} [description]
       */
      getScreenSize: function() {
        return screen.width + 'x' + screen.height;
      },
      getProject: function() {
        return '';
      },

      getReferrer: function() {
        var ref = doc.referrer || '';
        if (ref.indexOf('pass') > -1 || ref.indexOf('pwd') > -1) {
          return '403';
        }
        return ref;
      },

      getBrowser: function() {
        var browsers = {
          '360se-ua': '360se',
          'TT': 'tencenttraveler',
          'Maxthon': 'maxthon',
          'GreenBrowser': 'greenbrowser',
          'Sogou': 'se 1.x / se 2.x',
          'TheWorld': 'theworld'
        };

        for (var i in browsers) {
          if (ua.indexOf(browsers[i]) > -1) {
            return i;
          }
        }

        var is360se = false;
        try {
          if (+external.twGetVersion(external.twGetSecurityID(window)).replace(/\./g, "") > 1013) {
            is360se = true;
          }
        } catch (e) {}

        if (is360se) {
          return "360se-noua";
        }
        
        // chrome: Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/53…L, like Gecko) Chrome/60.0.3112.113 Safari/537.36
        // firefox: Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0
        var result = ua.match(/(msie|chrome|safari|firefox|opera|trident)/);
        result = result ? result[0] : '';

        // Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; WOW64; Trident/7.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; InfoPath.3; .NET4.0C; .NET4.0E)
        if (result == 'msie') { // ie5-10
          result = ua.match(/msie[^;]+/) + '';

        } else if (result == 'trident') { // ie11(edge)
          // Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; InfoPath.3; .NET4.0C; .NET4.0E; rv:11.0) like Gecko
          ua.replace(/trident\/[0-9].*rv[ :]([0-9.]+)/ig, function(a, c) {
            result = 'msie ' + c;
          });
        }

        return result;
      },

      getLocation: function() {
        var url = '';

        //避免IE下设置domain后，读取location.href属性报权限错误
        try {
          url = location.href;
        } catch (e) {
          url = doc.createElement('a');
          url.href = '';
          url = url.href;
        }

        //去掉queryString和Hash
        url = url.replace(/[?#].*$/, '');

        //如果不是.html .htm .shtml .php结尾的url，补上/
        url = /\.(s?htm|php)/.test(url) ? url : (url.replace(/\/$/, '') + '/');

        return url;
      },

      getGuid: (function() {
        function hash(s) {
          var h = 0,
            g = 0,
            i = s.length - 1;
          for (i; i >= 0; i--) {
            var code = parseInt(s.charCodeAt(i), 10);
            h = ((h << 6) & 0xfffffff) + code + (code << 14);
            if ((g = h & 0xfe00000) != 0) {
              h = (h ^ (g >> 21));
            }
          }
          return h;
        }

        function guid() {
          var s = [nav.appName, nav.version, nav.language || nav.browserLanguage, nav.platform, nav.userAgent, screen.width, 'x', screen.height, screen.colorDepth, doc.referrer].join(""),
            sLen = s.length,
            hLen = window.history.length;

          while (hLen) {
            s += (hLen--) ^ (sLen++);
          }

          return (Math.round(Math.random() * 2147483647) ^ hash(s)) * 2147483647;
        }

        var guidKey = '__guid',
          id = Cookie.get(guidKey);

        if (!id) {
          id = [hash(isLocal ? '' : doc.domain), guid(), +new Date + Math.random() + Math.random()].join('.');

          var config = {
            expires: 24 * 3600 * 1000 * 300,
            path: '/'
          };

          //如果是设置了guidCookieDomains，__guid放在guidCookieDomain域下
          if (guidCookieDomains.length) {
            for (var i = 0; i < guidCookieDomains.length; i++) {
              var guidCookieDomain = guidCookieDomains[i],
                gDomain = '.' + guidCookieDomain;

              if ((domain.indexOf(gDomain) > 0 && domain.lastIndexOf(gDomain) == domain.length - gDomain.length) 
                || domain == guidCookieDomain) {
                config.domain = gDomain;
                break;
              }
            }
          }

          Cookie.set(guidKey, id, config);
        }

        return function() {
          return id;
        };
      })(),

      getCount: (function() {
        var countKey = 'monitor_count',
          count = Cookie.get(countKey);

        count = (parseInt(count) || 0) + 1;

        Cookie.set(countKey, count, { expires: 24 * 3600 * 1000, path: '/' });

        return function() {
          return count;
        };
      })(),

      getFlashVer: function() {
        var ver = -1;
        if (nav.plugins && nav.mimeTypes.length) {
          var plugin = nav.plugins["Shockwave Flash"];
          if (plugin && plugin.description) {
            ver = plugin.description
              .replace(/([a-zA-Z]|\s)+/, "")
              .replace(/(\s)+r/, ".") + ".0";
          }
        } else if (window.ActiveXObject && !window.opera) {
          try {
            var c = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
            if (c) {
              var version = c.GetVariable("$version");
              ver = version.replace(/WIN/g, '').replace(/,/g, '.');
            }
          } catch (e) {}
        }

        ver = parseInt(ver, 10);
        return ver;
      },

      // 获取cid
      // el元素的区域标识; 一直循环到html元素, 找到就中断;
      // 规则一：el元素attributes是否有bk或者data-bk属性值
      // 规则二：el元素的
      getContainerId: function(el) {
        var areaStr,
          name,
          maxLength = 100;

        if (config.areaIds) {
          areaStr = new RegExp('^(' + config.areaIds.join('|') + ')$', 'ig');
        }

        while (el) {
          // bk模式; 
          // <div bk></div> bk可以不设置('bk' in el.attributes 也是true, bk为''空字符串)
          if (el.attributes && ('bk' in el.attributes || 'data-bk' in el.attributes)) {
            name = el.getAttribute('bk') || el.getAttribute('data-bk');

            if (name) {
              name = 'bk:' + name;
              return name.substr(0, maxLength);
            }

            // 如果bk为''
            if (el.id) {
              name = el.getAttribute('data-desc') || el.id;
              return name.substr(0, maxLength);
            }
          } else if (areaStr) { //setId模式
            if (el.id && areaStr.test(el.id)) {
              name = el.getAttribute('data-desc') || el.id;
              return name.substr(0, maxLength);
            }
          }

          el = el.parentNode;
        }

        return '';
      },

      // 获取c
      getText: function(el) {
        var str = "";

        if (el.tagName.toLowerCase() == 'input') {
          str = el.getAttribute('text') || el.getAttribute('data-text') || el.value || el.title || '';
        } else {
          str = el.getAttribute('text') || el.getAttribute('data-text') || el.innerText || el.textContent || el.title || '';
        }

        return StringH.trim(str).substr(0, 100);
      },

      // 获取f
      getHref: function(el) {
        try {
          return el.getAttribute('data-href') || el.href || '';
        } catch (e) {
          return '';
        }
      }
    };

    /**
     * 获取数据集合的方法
     * 可通过QIHOO_MONITOR_COMMON.data.[方法名]来访问
     * 增加或覆盖这里的方法，可以实现更多功能
     * @type {Object}
     */
    var data = {
      getBase: function() {
        return {
          p: util.getProject(),
          u: util.getLocation(),
          id: util.getGuid(),
          guid: util.getGuid()
        };
      },
      getTrack: function(cookies) {
        var obj = {
          b: util.getBrowser(),
          c: util.getCount(),
          r: util.getReferrer(),
          fl: util.getFlashVer(),
          sd: util.getColorDepth(),
          sr: util.getScreenSize(),
          ul: util.getLanguage()
        };
        //自定义要获取的 cookie
        if (cookies) {
          cookies = cookies.split(',');
          var cdata = [];
          for (var i = 0, length = cookies.length; i < length; i++) {
            var value = Cookie.get(cookies[i]);
            cdata.push(cookies[i] + '=' + encodeURIComponent(value));
          }
          obj.uc = encodeURIComponent(cdata.join('&'));
        }
        return obj;
      },

      // 如果返回false，此次点击不会打点！
      // {c: 点击元素的内容, f: 点击元素的去向, cid: 点击元素区域标识}
      getClick: function(e) {
        e = EventH.fix(e || window.event);
        var target = e.target,
          tagName = target.tagName,
          containerId = util.getContainerId(target);

        // <button></button>默认的type为 'submit'
        if (target.type && (target.type == 'submit' || target.type == 'button')) {
          var form = NodeH.parentNode(target, 'FORM'),
            result = {};
          if (form) {
            var formId = form.id || '',
              tId = target.id;

            result = {
              f: form.action,
              c: 'form:' + (form.name || formId),
              cId: containerId
            };

            if ((formId == 'search-form' || formId == 'searchForm') && (tId == 'searchBtn' || tId == 'search-btn')) {
              var keywordEl = $('kw') || $('search-kw') || $('kw1');
              result.w = keywordEl ? keywordEl.value : '';
            }
          } else {
            result = {
              f: util.getHref(target),
              c: util.getText(target),
              cId: containerId
            }
          }

          return result;
        } else if (tagName == 'AREA') {
          return {
            f: util.getHref(target),
            c: 'area:' + target.parentNode.name,
            cId: containerId
          };
        } else {
          var img, text;
          if (tagName == 'IMG') {
            img = target;
          }

          target = NodeH.parentNode(target, 'A');
          if (!target) return false;

          text = util.getText(target);

          return {
            f: util.getHref(target),
            c: text ? text : (img ? img.src.match(/[^\/]+$/) : ''),
            cId: containerId
          };
        }

        return false;
      },
      getKeydown: function(e) {
        e = EventH.fix(e || event);
        if (e.keyCode != 13) return false;

        var target = e.target,
          tagName = target.tagName,
          containerId = util.getContainerId(target);

        if (tagName == 'INPUT') {
          var form = NodeH.parentNode(target, 'FORM');
          if (form) {
            var formId = form.id || '',
              tId = target.id,
              result = {
                f: form.action,
                c: 'form:' + (form.name || formId),
                cId: containerId
              };

            if (tId == 'kw' || tId == 'search-kw' || tId == 'kw1') {
              result.w = target.value;
            }

            return result;
          }
        }
        return false;
      }
    };

    /**
     * 配置项
     * @type {Object}
     */
    var config = {
      'trackUrl': null,
      'clickUrl': null,
      'areaIds': null
    };

    var $ = function(str) {
      return document.getElementById(str);
    };

    return {
      version: version,

      util: util,

      data: data,

      config: config,

      // img通信；通信完后删掉(防止内存泄漏)
      sendLog: (function() {
        window.__QIHOO_MONITOR_COMMON_imgs = {};

        return function(url) {
          var id = 'log_' + (+new Date),
            img = window['__QIHOO_MONITOR_COMMON_imgs'][id] = new Image();

          img.onload = img.onerror = function() {
            if (window.__QIHOO_MONITOR_COMMON_imgs && window['__QIHOO_MONITOR_COMMON_imgs'][id]) {
              window['__QIHOO_MONITOR_COMMON_imgs'][id] = null;
              delete window["__QIHOO_MONITOR_COMMON_imgs"][id];
            }
          };
          img.src = url;
        };
      })(),

      // 添加基本baseParams; 拼接url和查询参数; 防止连续触发打点(100ms内只能打一次)
      buildLog: (function() {
        var lastLogParams = '';

        return function(params, url) {
          if (params === false) return;

          params = params || {};
          var baseParams = data.getBase();
          params = ObjectH.mix(baseParams, params, true);
          var logParams = url + ObjectH.encodeURIJson(params);

          //100ms后允许发相同数据
          if (logParams == lastLogParams) {
            return;
          }
          lastLogParams = logParams;
          setTimeout(function() { 
            lastLogParams = '';
          }, 100);

          // 加上时间戳，防止缓存
          var sendParams = ObjectH.encodeURIJson(params);
          sendParams += '&t=' + (+new Date); //加上时间戳，防止缓存

          url = url.indexOf('?') > -1 ?
            url + '&' + sendParams :
            url + '?' + sendParams;

          this.sendLog(url);
        };
      })(),

      // 打点type获取url;
      log: function(params, type) {
        type = type || 'click';

        var url = config[type + 'Url'];
        if (!url) {
          alert('Error : the ' + type + 'url does not exist!');
        }

        this.buildLog(params, url);
      },

      setConf: function(key, val) {
        var newConfig = {};
        if (!ObjectH.isObject(key)) {
          newConfig[key] = val;
        } else {
          newConfig = key;
        }

        this.config = ObjectH.mix(this.config, newConfig, true);
        return this;
      },

      setUrl: function(url) {
        if (url) {
          this.util.getLocation = function() {
            return url;
          };
        }
        return this;
      },

      setProject: function(prj) {
        if (prj) {
          this.util.getProject = function() {
            return prj;
          };
        }
        return this;
      },

      setId: function() {
        var areaIds = [],
          i = 0,
          argument;

        while (argument = arguments[i++]) {
          if (!ObjectH.isArray(argument)) {
            areaIds.push(argument);
          } else {
            areaIds = areaIds.concat(argument);
          }
        }

        this.setConf('areaIds', areaIds);
        return this;
      },

      // 获取track打点的参数; 调用log
      getTrack: function(cookies) {
        var params = this.data.getTrack(cookies);

        this.log(params, 'track');
        return this;
      },

      /**
       * 热力图
       * 功能：绑定mousedown事件，收集用户喜欢点击的区域
       * @return {[type]} [description]
       */
      getClickHeatmap: function(times, minutes) {
        // 防止多次绑定
        if (this.heatmapTimer) {
          return;
        }
        this.heatmapTimer = true;

        var that = this;
        var positions = [];
        times = times || 10;
        minutes = minutes || 5;

        var logTimer = 0;
        var log = function(flag) {
          clearTimeout(logTimer);

          // 点击次数大于10，打一次点
          if (flag || positions.length > times) {
            if (!positions.length) {
              return;
            }
            that.log({
              pos: positions.join(','),
              sr: util.getScreenSize()
            }, 'clickHeatMap');
            positions = [];
            return;
          }

          // 最后一次点击开始，5分钟之后，打一次点
          logTimer = setTimeout(function() {
            log(true);
          }, minutes * 60 * 1000);
        };

        NodeH.on(doc, 'mousedown', function(e) {
          var pos = e.pageX + '.' + e.pageY;
          positions.push(pos);
          log();
        });
        return this;
      },

      // 绑定鼠标mousedown和键盘keydown事件=>打点; 
      getClickAndKeydown: function() {
        var that = this;
        NodeH.on(doc, 'mousedown', function(e) {
          var params = that.data.getClick(e);
          that.log(params, 'click');
        });

        NodeH.on(doc, 'keydown', function(e) {
          var params = that.data.getKeydown(e);
          that.log(params, 'click');
        });

        // 防止多次绑定
        QIHOO_MONITOR_COMMON.getClickAndKeydown = function() {
          return that;
        };

        return this;
      }
    };
  })(window);

  //默认URL配置，并启用鼠标点击和按键统计
  QIHOO_MONITOR_COMMON.setConf({
    trackUrl: 'http://s.360.cn/w360/s.htm',
    clickUrl: 'http://s.360.cn/w360/c.htm',
    clickHeatMapUrl: 'http://s.360.cn/w360/c.htm',
    wpoUrl: 'http://s.360.cn/w360/p.htm'
  });

  window.QIHOO_MONITOR_COMMON = QIHOO_MONITOR_COMMON;

  if (typeof window.monitor === 'undefined') {
    window.monitor = QIHOO_MONITOR_COMMON;
  }
})();