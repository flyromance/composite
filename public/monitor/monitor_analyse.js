/*
 * track：进入页面就发，统计页面的展现次数
 * click：点击时发，统计用户点击的内容，(清楚什么情况下发请求)
 * heartMap：点击时发或者隔5分钟发，统计用户点击的区域坐标
 * wpo：
 * heartbeat：
 * 
 */
!(function() {
  if ("undefined" !== typeof window.QIHOO_MONITOR) return;
  var version = "v1.6.0 (2017.03.15)", // t
    guidCookieDomains = ["360.cn", "so.com", "leidian.com", "btime.com"]; // e

  // n
  var QIHOO_MONITOR = function(r, i) { // r=window
    var isLocal; // a
    var win = r;

    // 是否是本地 isLocal
    (function() {
      isLocal = true;
      try {
        var protocol = location.protocol.toLowerCase();
        "http:" != protocol && "https:" != protocol || (isLocal = false)
      } catch (e) {}
    }());

    var doc = document, // o
      nav = navigator, // c 
      screen = win.screen, // u
      domain = isLocal ? "" : document.domain.toLowerCase(), // s
      ua = nav.userAgent.toLowerCase(), // g 
      StringH = { // f
        trim: function(t) {
          return t.replace(/^[\s\xa0\u3000]+|[\u3000\xa0\s]+$/g, "")
        }
      },
      NodeH = { // d
        on: function(elem, type, n) {
          elem.addEventListener ? elem && elem.addEventListener(e, type, false) :
            elem && elem.attachEvent("on" + type, n)
        },
        parentNode: function(t, e, n) {
          n = n || 5;
          e = e.toUpperCase();
          for (; t && n-- > 0;) {
            if (t.tagName === e) return t;
            t = t.parentNode;
          }
          return null
        }
      },
      EventH = { // h
        fix: function(event) {
          if (!("target" in event)) {
            var target = event.srcElement || event.target;
            target && target.nodeType === 3 && (target = target.parentNode);
            event.target = target;
          }
          return t
        }
      },
      ObjectH = (function() { // l
        function type(t) {
          return null != t && null != t.constructor ? Object.prototype.toString.call(t).slice(8, -1).toLowerCase() : ""
        }
        return {
          isArray: function(e) {
            return "array" == type(e)
          },
          isObject: function(t) {
            return t != null && typeof t === 'object'
          },
          mix: function(t, e, cover) {
            for (var key in e) {
              !cover && (t[key] || key in t) || (t[key] = e[key])
            }
            return t
          },
          encodeURIJson: function(t) {
            var e = [];
            for (var n in t) null != t[n] && e.push(encodeURIComponent(n) + "=" + encodeURIComponent(t[n]));
            return e.join("&")
          }
        }
      }()),
      Cookie = { // m
        get: function(t) {
          try {
            var e, n = new RegExp("(^| )" + t + "=([^;]*)(;|$)");
            return (e = o.cookie.match(n)) ? unescape(e[2]) : ""
          } catch (r) {
            return ""
          }
        },
        set: function(t, e, n) {
          n = n || {};
          var r = n.expires;
          "number" == typeof r && (r = new Date, r.setTime(r.getTime() + n.expires));
          try {
            o.cookie = t + "=" + escape(e) +
              (r ? "; expires=" + r.toGMTString() : "") +
              (n.path ? "; path=" + n.path : "") +
              (n.domain ? "; domain=" + n.domain : "")
          } catch (i) {}
        }
      },
      util = { // p
        getColorDepth: function() {
          return screen.colorDepth + "-bit"
        },
        getLanguage: function() {
          return (nav.language || nav.browserLanguage).toLowerCase()
        },
        getScreenSize: function() {
          return u.width + "x" + u.height
        },
        getProject: function() {
          return ""
        },
        getReferrer: function() {
          var t = doc.referrer || "";
          return t.indexOf("pass") > -1 || t.indexOf("pwd") > -1 ? "403" : t
        },
        getBrowser: function() {
          var t = {
            "360se-ua": "360se",
            TT: "tencenttraveler",
            Maxthon: "maxthon",
            GreenBrowser: "greenbrowser",
            Sogou: "se 1.x / se 2.x",
            TheWorld: "theworld"
          };
          for (var e in t) {
            if (g.indexOf(t[e]) > -1) return e;
          }

          var n = !1;
          try {
            +external.twGetVersion(external.twGetSecurityID(r)).replace(/\./g, "") > 1013 && (n = !0)
          } catch (i) {}
          if (n) return "360se-noua";
          var a = g.match(/(msie|chrome|safari|firefox|opera|trident)/);
          a = a ? a[0] : "";
          "msie" == a ?
            a = g.match(/msie[^;]+/) + "" :
            "trident" == a && g.replace(/trident\/[0-9].*rv[ :]([0-9.]+)/gi, function(t, e) { a = "msie " + e });
          return a
        },
        getLocation: function() {
          var t = "";
          try {
            t = location.href;
          } catch (e) {
            t = o.createElement("a");
            t.href = "";
            t = t.href;
          }
          return t = /\.(s?htm|php)/.test(t) ? t : t.replace(/\/$/, "") + "/"
        },
        hash: function(t) {
          var e = 0,
            n = 0,
            r = t.length - 1;
          for (r; r >= 0; r--) {
            var i = parseInt(t.charCodeAt(r), 10);
            e = (e << 6 & 268435455) + i + (i << 14), 0 != (n = 266338304 & e) && (e ^= n >> 21)
          }
          return e
        },

        // 3879293212461102600
        guid: function() {
          var
            t = [c.appName, c.version, c.language || c.browserLanguage, c.platform, c.userAgent, u.width, "x", u.height, u.colorDepth, o.referrer].join(""),
            e = t.length,
            n = r.history.length;
          for (; n;) {
            t += (n--) ^ (e++);
          }
          return 2147483647 * (Math.round(2147483647 * Math.random()) ^ p.hash(t))
        },

        // 196757375.3879293212461102600.1504767284590.757
        getSid: function() {
          var t = "__sid", // t
            e = "__DC_sid", // e
            n = Cookie.get(e); // n

          if (!n && (n = Cookie.get(t))) {
            var r = n.split(".");
            4 !== r.length && (n = null)
          }
          n || (n = [util.hash(isLocal ? "" : o.domain), util.guid(), +new Date + Math.random()].join("."));
          var i = { expires: 60 * (util._activeTime || 30) * 1000, path: "/" }; // 有效期
          Cookie.set(e, n, i);
          return n
        },

        // ''
        getMid: function() {
          try {
            return external.GetMID(external.GetSID(window))
          } catch (t) {
            return ""
          }
        },

        // 196757375.758527535.1499844407745.1504780226912.1316
        getGid: function() {
          var t = "__gid",
            n = "__DC_gid",
            r = Cookie.get(n);

          if (!r && (r = Cookie.get(t))) {
            var i = r.split(".");
            5 !== i.length && (r = null)
          }

          if (r) {
            r = r.split(".");
            r[3] = (new Date).getTime();
            r[4] = (parseInt(r[4]) || 1) + 1;
            r = r.join(".")
          } else {
            r = [p.hash(isLocal ? "" : o.domain), Math.floor(1e9 * Math.random()), +new Date, +new Date, 1].join(".")
          }

          var c = { expires: 63072e6, path: "/" }; // 2年有效期
          if (e.length)
            for (var u = 0; u < e.length; u++) {
              var g = e[u],
                f = "." + g;
              if (s.indexOf(f) > 0 && s.lastIndexOf(f) == s.length - f.length || s == g) {
                c.domain = f;
                break
              }
            }
          Cookie.set(n, r, c);
          return r
        },
        getGuid: function() {
          var t = "__guid",
            n = Cookie.get(t);

          if (!n) {
            n = [util.hash(a ? "" : o.domain), util.guid(), +new Date + Math.random() + Math.random()].join(".");
            var r = { expires: 2592e7, path: "/" };
            if (guidCookieDomains.length)
              for (var i = 0; i < guidCookieDomains.length; i++) {
                var c = guidCookieDomains[i],
                  u = "." + c;
                if (s.indexOf(u) > 0 && s.lastIndexOf(u) == s.length - u.length || s == c) {
                  r.domain = u;
                  break;
                }
              }
            Cookie.set(t, n, r)
          }
          return n
        },
        getCount: function() {
          var t = "monitor_count",
            e = "__DC_monitor_count",
            n = Cookie.get(e);
          n || (n = m.get(t));
          n = (parseInt(n) || 0) + 1;

          Cookie.set(e, n, {
            expires: 864e5, // 1天有效期
            path: "/"
          });

          return function() {
            return n
          }
        }(),
        getFlashVer: function() {
          var t = -1;
          if (nav.plugins && nav.mimeTypes.length) {
            var e = nav.plugins["Shockwave Flash"];
            e && e.description && (t = e.description.replace(/([a-zA-Z]|\s)+/, "").replace(/(\s)+r/, ".") + ".0")
          } else if (win.ActiveXObject && !win.opera) {
            try {
              var n = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
              if (n) {
                var i = n.GetVariable("$version");
                t = i.replace(/WIN/g, "").replace(/,/g, ".")
              }
            } catch (e) {}
          }
          return t = parseInt(t, 10)
        },
        getContainerId: function(t) {
          var e, n, r = 100;
          config.areaIds && (e = new RegExp("^(" + config.areaIds.join("|") + ")$", "ig"))
          while (t) {
            if (t.attributes && ("bk" in t.attributes || "data-bk" in t.attributes)) {
              if (n = t.getAttribute("bk") || t.getAttribute("data-bk")) return n = "bk:" + n, n.substr(0, r);
              if (t.id) return n = t.getAttribute("data-desc") || t.id, n.substr(0, r)
            } else if (e && t.id && e.test(t.id)) {
              return n = t.getAttribute("data-desc") || t.id, n.substr(0, r);
            }
            t = t.parentNode
          }
          return ""
        },
        getText: function(t) {
          var e = "";
          if ("input" == t.tagName.toLowerCase()) {
            e = t.getAttribute("text") || t.getAttribute("data-text") || t.value || t.title || "";
          } else {
            e = t.getAttribute("text") || t.getAttribute("data-text") || t.innerText || t.textContent || t.title || "";
          }
          return f.trim(e).substr(0, 100)
        },
        getHref: function(t) {
          try {
            return t.getAttribute("data-href") || t.href || ""
          } catch (e) {
            return ""
          }
        }
      },
      data = { // v
        getBase: function() {
          return {
            p: p.getProject(),
            u: p.getLocation(),
            guid: p.getGuid(),
            gid: p.getGid(),
            sid: p.getSid(),
            title: document.title,
            mid: p.getMid()
          }
        },
        getTrack: function(t) {
          var e = p.getSid() === p.getSid() ? 1 : 0,
            n = {
              b: p.getBrowser(),
              c: p.getCount(),
              r: p.getReferrer(),
              fl: p.getFlashVer(),
              sd: p.getColorDepth(),
              sr: p.getScreenSize(),
              ul: p.getLanguage(),
              ce: e
            };
          if (t) {
            t = t.split(",");
            for (var r = [], i = 0, a = t.length; i < a; i++) {
              var o = m.get(t[i]);
              r.push(t[i] + "=" + encodeURIComponent(o));
            }
            n.uc = encodeURIComponent(r.join("&"));
          }

          return n
        },
        getClick: function(t) {
          t = h.fix(t || event);
          var e = t.target,
            n = e.tagName,
            r = p.getContainerId(e);
          if (!e.type || "submit" != e.type && "button" != e.type) {
            if ("AREA" == n) return { f: p.getHref(e), c: "area:" + e.parentNode.name, cId: r };
            var i, a;
            return "IMG" == n && (i = e), !!(e = d.parentNode(e, "A")) && (a = p.getText(e), { f: p.getHref(e), c: a ? a : i ? i.src.match(/[^\/]+$/) : "", cId: r })
          }
          var o = d.parentNode(e, "FORM"),
            c = {};
          if (o) {
            var u = o.id || "",
              s = e.id;
            if (c = { f: o.action, c: "form:" + (o.name || u), cId: r }, !("search-form" != u && "searchForm" != u || "searchBtn" != s && "search-btn" != s)) {
              var g = b("kw") || b("search-kw") || b("kw1");
              c.w = g ? g.value : ""
            }
          } else c = { f: p.getHref(e), c: p.getText(e), cId: r };
          return c
        },
        getKeydown: function(t) {
          if (t = h.fix(t || event), 13 != t.keyCode) return !1;
          var e = t.target,
            n = e.tagName,
            r = p.getContainerId(e);
          if ("INPUT" == n) {
            var i = d.parentNode(e, "FORM");
            if (i) {
              var a = i.id || "",
                o = e.id,
                c = { f: i.action, c: "form:" + (i.name || a), cId: r };
              return "kw" != o && "search-kw" != o && "kw1" != o || (c.w = e.value), c
            }
          }
          return !1
        },
        getBaseExtend: function() {
          return {}
        }
      },
      config = { // w
        trackUrl: null,
        clickUrl: null,
        areaIds: null,
        hbLogTimer: 0
      },
      $ = function(t) { // b
        return document.getElementById(t)
      };

    return {
      version: version,
      util: util,
      data: data,
      config: config,
      sendLog: (function() {
        r.__qihoo_monitor_imgs = {};

        return function(t) {
          var e = "log_" + +new Date,
            n = r.__qihoo_monitor_imgs[e] = new Image;
          n.onload = n.onerror = function() {
            r.__qihoo_monitor_imgs && r.__qihoo_monitor_imgs[e] && (r.__qihoo_monitor_imgs[e] = null, delete r.__qihoo_monitor_imgs[e])
          };
          n.src = t
        }
      })(),
      buildLog: (function() {
        var t = "";

        return function(param, n) {
          if (param === false) return;
          param = param || {};
          var r = v.getBase(),
            i = v.getBaseExtend(),
            a = ObjectH.mix(r, i, true);
          param = ObjectH.mix(a, param, true);
          var o = n + ObjectH.encodeURIJson(param);
          if (o != t) {
            t = o;
            setTimeout(function() {
              t = ""
            }, 100);
            var c = ObjectH.encodeURIJson(param);
            c += "&t=" + (+new Date);
            n = n.indexOf("?") > -1 ? n + "&" + c : n + "?" + c;
            this.sendLog(n);
          }
        }
      })(),
      log: function(param, type) {
        type = type || "click";
        var url = w[type + "Url"];
        url || alert("Error : the " + type + "url does not exist!");
        this.buildLog(param, url);
      },
      setConf: function(t, e) {
        var n = {};
        l.isObject(t) ? n = t : n[t] = e;
        this.config = l.mix(this.config, n, true);

        return this
      },
      setUrl: function(t) {
        t && (this.util.getLocation = function() {
          return t
        });

        return this
      },
      setProject: function(t, e) {
        t && (this.util.getProject = function() {
          return t
        });

        e && ObjectH.isObject(e) && (this.data.getBaseExtend = function() {
          return e
        });

        return this
      },
      setId: function() {
        for (var t, e = [], n = 0; t = arguments[n++];) {
          l.isArray(t) ? e = e.concat(t) : e.push(t);
        }
        this.setConf("areaIds", e);

        return this;
      },
      init: function() {
        this.getClickAndKeydown();
        this.getClickHeatmap(10, 1);
      },
      getTrack: function(cookies, param) {
        var obj = this.data.getTrack(cookies);
        ObjectH.isObject(param) && (obj = l.mix(obj, param, true));
        this.log(obj, "track");

        return this
      },
      getClickHeatmap: function(t, e) {
        // 保证只执行一次逻辑
        if (!this.heatmapTimer) {
          this.heatmapTimer = true;
          var n = this,
            r = [];
          t = t || 10; // 超过10次，才发
          e = e || 5; // 过五分钟，才发
          var i = 0,
            a = function(o) {
              clearTimeout(i);
              if (o || r.length > t) {
                if (!r.length) return;
                n.log({ pos: r.join(","), sr: p.getScreenSize() }, "clickHeatMap");
                r = [];
              }
              i = setTimeout(function() {
                a(true);
              }, 60 * e * 1e3);
            };
          d.on(o, "mousedown", function(t) {
            var e = t.pageX + "." + t.pageY;
            r.push(e);
            a();
          });

          return this
        }
      },
      getClickAndKeydown: function() {
        var t = this;

        doc.on(o, "mousedown", function(e) {
          var n = t.data.getClick(e);
          t.log(n, "click")
        });

        doc.on(o, "keydown", function(e) {
          var n = t.data.getKeydown(e);
          t.log(n, "click")
        });

        // 确保：只绑定一次
        QIHOO_MONITOR.getClickAndKeydown = function() {
          return t
        };

        return this
      },
      beginHeartBeat: function(id, e, n) {
        var min = 5,
          max = 60,
          a = 10, // 默认10s打一次
          o = {};

        o.id = id;
        l.isObject(e) && (o = l.mix(o, e, false));
        n = isNaN(n) ? a : n;
        // n = Math.min(max, Math.max(min, n));
        n > max ? n = max : n < min && (n = min); // min <= n <= max

        var that = this,
          u = function(t) {
            o.steptime = t;
            that.setConf("hbStarttime", +new Date());
            that.log(o, "heartbeat");
            clearTimeout(w.hbLogTimer);
            w.hbLogTimer = setTimeout(function() {
              var t = (+new Date() - w.hbStarttime) / 1000;
              u(t);
            }, 1000 * n);
          };
        u(0);

        return this
      },
      endHeartBeat: function(t, e) {
        if (w.hbStarttime != null) {
          var n = {};
          n.id = t;
          l.isObject(e) && (n = l.mix(n, e, !1));
          clearTimeout(w.hbLogTimer);
          n.steptime = (+new Date() - w.hbStarttime) / 1000;
          this.log(n, "heartbeat");
          this.setConf("hbStarttime", null)
        }
        return this
      },
      setActiveTime: function(t) {
        util._activeTime = t;
        return this
      }
    }
  }(window);

  var protocol = location.protocol.toLowerCase() === "https:" ? "https:" : "http:";

  QIHOO_MONITOR.setConf({
    trackUrl: protocol + "//s.360.cn/qdas/s.htm",
    clickUrl: protocol + "//s.360.cn/qdas/c.htm",
    clickHeatMapUrl: protocol + "//s.360.cn/qdas/t.htm",
    wpoUrl: protocol + "//s.360.cn/qdas/p.htm",
    heartbeatUrl: protocol + "//s.360.cn/qdas/h.htm"
  }).init();

  window.QIHOO_MONITOR = QIHOO_MONITOR;

  typeof window.monitor === 'undefined' && (window.monitor = QIHOO_MONITOR);
})();