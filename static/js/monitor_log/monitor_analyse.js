!(function () {
    if ("undefined" !== typeof window.QIHOO_MONITOR) return;
    var t = "v1.6.0 (2017.03.15)",
        e = ["360.cn", "so.com", "leidian.com", "btime.com"];

    var n = function (r, i) {
        var a;
        var win = r;

        (function () {
            a = !0;
            try {
                var t = location.protocol.toLowerCase();
                "http:" != t && "https:" != t || (a = !1)
            } catch (e) {}
        }());

        var o = document,
            c = navigator,
            u = r.screen,
            s = a ? "" : document.domain.toLowerCase(),
            g = c.userAgent.toLowerCase(),
            f = {
                trim: function (t) {
                    return t.replace(/^[\s\xa0\u3000]+|[\u3000\xa0\s]+$/g, "")
                }
            },
            d = {
                on: function (elem, type, n) { 
                    elem.addEventListener ? elem && elem.addEventListener(e, type, false) 
                    : elem && elem.attachEvent("on" + type, n) 
                },
                parentNode: function (t, e, n) {
                    n = n || 5;
                    e = e.toUpperCase();
                    for (; t && n-- > 0;) {
                        if (t.tagName === e) return t;
                        t = t.parentNode;
                    }
                    return null
                }
            },
            h = {
                fix: function (event) {
                    if (!("target" in event)) {
                        var target = event.srcElement || event.target;
                        target && target.nodeType === 3 && (target = target.parentNode);
                        event.target = target;
                    }
                    return t
                }
            },
            l = (function () {
                function type(t) {
                    return null != t && null != t.constructor ? Object.prototype.toString.call(t).slice(8, -1).toLowerCase() : ""
                }
                return {
                    isArray: function (e) {
                        return "array" == type(e)
                    },
                    isObject: function (t) {
                        return t != null && typeof t === 'object'
                    },
                    mix: function (t, e, cover) {
                        for (var key in e) {
                            !cover && (t[key] || key in t) || (t[key] = e[key])
                        }
                        return t
                    },
                    encodeURIJson: function (t) {
                        var e = [];
                        for (var n in t) null != t[n] && e.push(encodeURIComponent(n) + "=" + encodeURIComponent(t[n]));
                        return e.join("&")
                    }
                }
            }()),
            m = {
                get: function (t) {
                    try {
                        var e, n = new RegExp("(^| )" + t + "=([^;]*)(;|$)");
                        return (e = o.cookie.match(n)) ? unescape(e[2]) : ""
                    } catch (r) {
                        return ""
                    }
                },
                set: function (t, e, n) {
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
            p = {
                getColorDepth: function () {
                    return u.colorDepth + "-bit"
                },
                getLanguage: function () {
                    return (c.language || c.browserLanguage).toLowerCase()
                },
                getScreenSize: function () {
                    return u.width + "x" + u.height
                },
                getProject: function () {
                    return ""
                },
                getReferrer: function () {
                    var t = o.referrer || "";
                    return t.indexOf("pass") > -1 || t.indexOf("pwd") > -1 ? "403" : t
                },
                getBrowser: function () {
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
                        "trident" == a && g.replace(/trident\/[0-9].*rv[ :]([0-9.]+)/gi, function (t, e) { a = "msie " + e });
                    return a
                },
                getLocation: function () {
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
                hash: function (t) {
                    var e = 0,
                        n = 0,
                        r = t.length - 1;
                    for (r; r >= 0; r--) {
                        var i = parseInt(t.charCodeAt(r), 10);
                        e = (e << 6 & 268435455) + i + (i << 14), 0 != (n = 266338304 & e) && (e ^= n >> 21)
                    }
                    return e
                },
                guid: function () {
                    for (var t = [c.appName, c.version, c.language || c.browserLanguage, c.platform, c.userAgent, u.width, "x", u.height, u.colorDepth, o.referrer].join(""), e = t.length, n = r.history.length; n;) t += n-- ^ e++;
                    return 2147483647 * (Math.round(2147483647 * Math.random()) ^ p.hash(t))
                },
                getSid: function () {
                    var t = "__sid",
                        e = "__DC_sid",
                        n = m.get(e);
                    if (!n && (n = m.get(t))) {
                        var r = n.split(".");
                        4 !== r.length && (n = null)
                    }
                    n || (n = [p.hash(a ? "" : o.domain), p.guid(), +new Date + Math.random()].join("."));
                    var i = { expires: 60 * (p._activeTime || 30) * 1e3, path: "/" };
                    return m.set(e, n, i), n
                },
                getMid: function () {
                    try {
                        return external.GetMID(external.GetSID(r))
                    } catch (t) {
                        return ""
                    }
                },
                getGid: function () {
                    var t = "__gid",
                        n = "__DC_gid",
                        r = m.get(n);
                    if (!r && (r = m.get(t))) {
                        var i = r.split(".");
                        5 !== i.length && (r = null)
                    }
                    r ? (r = r.split("."), r[3] = (new Date).getTime(), r[4] = (parseInt(r[4]) || 1) + 1, r = r.join(".")) : r = [p.hash(a ? "" : o.domain), Math.floor(1e9 * Math.random()), (new Date).getTime(), (new Date).getTime(), 1].join(".");
                    var c = { expires: 63072e6, path: "/" };
                    if (e.length)
                        for (var u = 0; u < e.length; u++) {
                            var g = e[u],
                                f = "." + g;
                            if (s.indexOf(f) > 0 && s.lastIndexOf(f) == s.length - f.length || s == g) {
                                c.domain = f;
                                break
                            }
                        }
                    return m.set(n, r, c), r
                },
                getGuid: function () {
                    var t = "__guid",
                        n = m.get(t);
                    if (!n) {
                        n = [p.hash(a ? "" : o.domain), p.guid(), +new Date + Math.random() + Math.random()].join(".");
                        var r = { expires: 2592e7, path: "/" };
                        if (e.length)
                            for (var i = 0; i < e.length; i++) {
                                var c = e[i],
                                    u = "." + c;
                                if (s.indexOf(u) > 0 && s.lastIndexOf(u) == s.length - u.length || s == c) {
                                    r.domain = u;
                                    break
                                }
                            }
                        m.set(t, n, r)
                    }
                    return n
                },
                getCount: function () {
                    var t = "monitor_count",
                        e = "__DC_monitor_count",
                        n = m.get(e);
                    return n || (n = m.get(t)), n = (parseInt(n) || 0) + 1, m.set(e, n, { expires: 864e5, path: "/" }),
                        function () {
                            return n
                        }
                }(),
                getFlashVer: function () {
                    var t = -1;
                    if (c.plugins && c.mimeTypes.length) {
                        var e = c.plugins["Shockwave Flash"];
                        e && e.description && (t = e.description.replace(/([a-zA-Z]|\s)+/, "").replace(/(\s)+r/, ".") + ".0")
                    } else if (r.ActiveXObject && !r.opera) try {
                        var n = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
                        if (n) {
                            var i = n.GetVariable("$version");
                            t = i.replace(/WIN/g, "").replace(/,/g, ".")
                        }
                    } catch (a) {}
                    return t = parseInt(t, 10)
                },
                getContainerId: function (t) {
                    var e, n, r = 100;
                    for (w.areaIds && (e = new RegExp("^(" + w.areaIds.join("|") + ")$", "ig")); t;) {
                        if (t.attributes && ("bk" in t.attributes || "data-bk" in t.attributes)) {
                            if (n = t.getAttribute("bk") || t.getAttribute("data-bk")) return n = "bk:" + n, n.substr(0, r);
                            if (t.id) return n = t.getAttribute("data-desc") || t.id, n.substr(0, r)
                        } else if (e && t.id && e.test(t.id)) return n = t.getAttribute("data-desc") || t.id, n.substr(0, r);
                        t = t.parentNode
                    }
                    return ""
                },
                getText: function (t) {
                    var e = "";
                    return e = "input" == t.tagName.toLowerCase() ? t.getAttribute("text") || t.getAttribute("data-text") || t.value || t.title || "" : t.getAttribute("text") || t.getAttribute("data-text") || t.innerText || t.textContent || t.title || "", f.trim(e).substr(0, 100)
                },
                getHref: function (t) {
                    try {
                        return t.getAttribute("data-href") || t.href || ""
                    } catch (e) {
                        return ""
                    }
                }
            },
            v = {
                getBase: function () {
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
                getTrack: function (t) {
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
                getClick: function (t) {
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
                getKeydown: function (t) {
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
                getBaseExtend: function () {
                    return {}
                }
            },
            w = { 
                trackUrl: null, 
                clickUrl: null, 
                areaIds: null, 
                hbLogTimer: 0 
            },
            b = function (t) {
                return document.getElementById(t)
            };
        return {
            version: t,
            util: p,
            data: v,
            config: w,
            sendLog: (function () {
                r.__qihoo_monitor_imgs = {};

                return function (t) {
                    var e = "log_" + +new Date,
                        n = r.__qihoo_monitor_imgs[e] = new Image;
                    n.onload = n.onerror = function () {
                        r.__qihoo_monitor_imgs && r.__qihoo_monitor_imgs[e] && (r.__qihoo_monitor_imgs[e] = null, delete r.__qihoo_monitor_imgs[e])
                    };
                    n.src = t
                }
            })(),
            buildLog: (function () {
                var t = "";

                return function (e, n) {
                    if (e !== !1) {
                        e = e || {};
                        var r = v.getBase(),
                            i = v.getBaseExtend(),
                            a = l.mix(r, i, !0);
                        e = l.mix(a, e, !0);
                        var o = n + l.encodeURIJson(e);
                        if (o != t) {
                            t = o;
                            setTimeout(function () {
                                t = ""
                            }, 100);
                            var c = l.encodeURIJson(e);
                            c += "&t=" + (+new Date);
                            n = n.indexOf("?") > -1 ? n + "&" + c : n + "?" + c;
                            this.sendLog(n)
                        }
                    }
                }
            })(),
            log: function (param, type) {
                type = type || "click";
                var url = w[type + "Url"];
                url || alert("Error : the " + type + "url does not exist!");
                this.buildLog(param, url);
            },
            setConf: function (t, e) {
                var n = {};
                l.isObject(t) ? n = t : n[t] = e;
                this.config = l.mix(this.config, n, true);

                return this
            },
            setUrl: function (t) {
                t && (this.util.getLocation = function () {
                    return t
                });

                return this
            },
            setProject: function (t, e) {
                t && (this.util.getProject = function () {
                    return t
                });

                e && l.isObject(e) && (this.data.getBaseExtend = function () {
                    return e
                });

                return this
            },
            setId: function () {
                for (var t, e = [], n = 0; t = arguments[n++];) {
                    l.isArray(t) ? e = e.concat(t) : e.push(t);
                }
                this.setConf("areaIds", e);

                return this;
            },
            init: function () {
                this.getClickAndKeydown();
                this.getClickHeatmap(10, 1);
            },
            getTrack: function (t, e) {
                var n = this.data.getTrack(t);
                l.isObject(e) && (n = l.mix(n, e, !0));
                this.log(n, "track");

                return this
            },
            getClickHeatmap: function (t, e) {
                // 保证只执行一次逻辑
                if (!this.heatmapTimer) {
                    this.heatmapTimer = true;
                    var n = this,
                        r = [];
                    t = t || 10; // 超过10次，才发
                    e = e || 5; // 过五分钟，才发
                    var i = 0,
                        a = function (o) {
                            clearTimeout(i);
                            if (o || r.length > t) {
                                if (!r.length) return;
                                n.log({ pos: r.join(","), sr: p.getScreenSize() }, "clickHeatMap");
                                r = [];
                            }
                            i = setTimeout(function () {
                                a(true);
                            }, 60 * e * 1e3);
                        };
                    d.on(o, "mousedown", function (t) {
                        var e = t.pageX + "." + t.pageY;
                        r.push(e);
                        a();
                    });

                    return this
                }
            },
            getClickAndKeydown: function () {
                var t = this;

                d.on(o, "mousedown", function (e) {
                    var n = t.data.getClick(e);
                    t.log(n, "click")
                });

                d.on(o, "keydown", function (e) {
                    var n = t.data.getKeydown(e);
                    t.log(n, "click")
                });

                // 确保：只绑定一次
                n.getClickAndKeydown = function () {
                    return t
                };

                return this
            },
            beginHeartBeat: function (t, e, n) {
                var r = 5,
                    i = 60,
                    a = 10,
                    o = {};

                o.id = t;
                l.isObject(e) && (o = l.mix(o, e, !1));
                n = isNaN(n) ? a : n;
                n > i ? n = i : n < r && (n = r);

                var c = this,
                    u = function (t) {
                        o.steptime = t;
                        c.setConf("hbStarttime", +new Date());
                        c.log(o, "heartbeat");
                        clearTimeout(w.hbLogTimer);
                        w.hbLogTimer = setTimeout(function () {
                            var t = (+new Date() - w.hbStarttime) / 1000;
                            u(t);
                        }, 1000 * n);
                    };   
                u(0);    

                return this
            },
            endHeartBeat: function (t, e) {
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
            setActiveTime: function (t) {
                p._activeTime = t;
                return this
            }
        }
    }(window);

    var protocal = location.protocol.toLowerCase() === "https:" ? "https:" : "http:";

    n.setConf({
        trackUrl: protocal + "//s.360.cn/qdas/s.htm",
        clickUrl: protocal + "//s.360.cn/qdas/c.htm",
        clickHeatMapUrl: protocal + "//s.360.cn/qdas/t.htm",
        wpoUrl: protocal + "//s.360.cn/qdas/p.htm",
        heartbeatUrl: protocal + "//s.360.cn/qdas/h.htm"
    }).init();

    window.QIHOO_MONITOR = n;

    typeof window.monitor === 'undefined' && (window.monitor = n);
})();