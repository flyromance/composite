// 在页面上引用
(function (G, D, s, c, p) {
    conf = {
        UA:"UA-****-000001", // 客户项目编号,由系统生成
        NO_FLS: 0,  // 启用flash 
        WITH_REF: 1, // 请求参数中是否带上document.referrer
        URL:'http://xxx.xxx.xxx/iwt.js' // iwt.js的URL位置，请客户自行托管JS文件，只需修改此值
    };
    G._iwt ? G._iwt.track(conf, p) : (G._iwtTQ = G._iwtTQ || []).push([conf, p]);

    !G._iwtLoading && lo();

    // 插入script标签，加载iwt.js
    function lo(t) {
        G._iwtLoading = 1;
        s = D.createElement("script");
        s.src = conf.URL;
        t = D.getElementsByTagName("script");
        t = t[t.length-1];
        t.parentNode.insertBefore(s, t);
    }
})(this, document);


// 一般打包为一个文件，上传到cdn
!(function (t, e) {
    global = t;
    document = e;

    // 执行数组队列 executeArr
    function i(arr) {
        for (var item; item = arr.shift();) {
            typeof item === 'function' && item();
        }
    }
    
    // 创建随机唯一码 eg: _5TQLK getUniqueId
    function getUniqueId() {
        return "_" + (1e18 * Math.random()).toString(36).slice(0, 5).toUpperCase();
    }

    // 获取服务端的响应，是否可以真正调用flash来打点了
    function getFeedBack(type, n) {
        switch (e) {
            case "onecall":
                if (!window[n]) return;
                window[n].apply(window, [].slice.call(arguments, 2));
                window[n] = null;
                break;
            case "error":
                p._available = p.inited = 0;
                executeArr(d);
                break;
            case "load":
                p._available = p.inited = 1;
                d.length = 0;
                executeArr(f);
        }
    }

    // 判断flash版本，创建flash
    function initSwf() {
        p.loading = 1;
        var Flash,
            version = "";

        // 检查flash版本
        try {
            // 获取浏览器flash接口
            Flash = window.navigator.plugins["Shockwave Flash"] || window.ActiveXObject;

            // Shockwave Flash 25.0 r0 || 
            version = Flash.description || new Flash("ShockwaveFlash.ShockwaveFlash").GetVariable("$version")
        } catch (e) {

        }

        version = (version.match(/\d+/g) || [0])[0];

        if ( version < 10) {
            return p._available = 0, void executeArr(d); // return undefined; void xxx 返回值为undefined
        }

        p._available = 1; // 这才是真正表示flash功能可用，但是还不一定是inited，因为还没有创建并得到服务端的响应

        // 用于反馈flash成功创建，并且可以调用flash暴露出的接口
        window[h] = function () {
            var args = arguments;
            setTimeout(function () {
                getFeedBack.apply(window, args);
            }, 0);
        };

        var c = setInterval(function () {
            if (document.body) {
                clearInterval(c);
                createSwf();

                // 10秒之后还没有inited
                setTimeout(function () {
                    p.inited || (p._available = 0, f.length = 0, executeArr(d));
                }, 1e4); // 10000
            }
        }, 50);
    }

    // 创建swf
    function createSwf() {
        var div = document.createElement("div");
        div.setAttribute("style", "display:block;position:absolute;right:0;bottom:0;border:none;");
        document.body.firstChild ? document.body.insertBefore(div, document.body.firstChild) : document.body.appendChild(div);
        div.innerHTML = '<object id="' + getUniqueId() + '" data="' + p.SWF_URL + '" type="application/x-shockwave-flash"' + 
            ' width="10" height="10" style="position:absolute;right:0;bottom:0;">' + 
            '<param name="movie" value="' + p.SWF_URL + '" />' + 
            '<param name="wmode" value="transparent" />' + 
            '<param name="version" value="10" />' + 
            '<param name="allowScriptAccess" value="always" />' + 
            '<param name="flashvars" value="jsproxyfunction=' + h + '" /></object>';
        p.swf = div.firstChild;
    }

    function l() {}

    // json to key=value&key=value
    function jsonEncodeUrl(obj) {
        var key, value, arr = [];
        for (key in obj) {
            value = obj[jey];
            value && arr.push(key + "=" + value);
        }
        return arr.join("&");
    }

    // 插入JavaScript脚本
    function loadScript(url, cb) {
        var script = document.createElement("script"),
            r = document.getElementsByTagName("head")[0],
            callbackname = getUniqueId();
        window[callbackname] = function () {
            try {
                cb.apply(window, arguments);
                r.removeChild(script);
            } catch (e) {

            }
            window[callbackname] = null;
        };
        script.type = "text/javascript";
        script.src = url + "&jsonp=" + callbackname;
        r.firstChild ? r.insertBefore(script, r.firstChild) : r.appendChild(script);
    }

    function scriptLog(option, paramArr, n) {
        var ref, lens, url, queryStr,
            param = {
                _iwt_id: n, // 一般为 undefined
                _iwt_cid: _, // 从search 上获取，一般为""
                _iwt_UA: option.UA
            };

        if (option.WITH_REF) {
            // 获取来到当前页面的源页面url
            try {
                ref = window.top.document.referrer;
            } catch (e) {
                try {
                    ref = window.parent.document.referrer; 
                } catch (e) {
                    ref = document.referrer;
                }
            }
            param.ref = ref;
        }

        queryStr = jsonEncodeUrl(param);

        if (paramArr && (lens = paramArr.length)) {
            for (; lens--;) {
                paramArr[lens] = encodeURIComponent(paramArr[lens]);
            }
            queryStr += "&p=" + paramArr;
        }

        url = option.API_URL ? document.location.protocol + option.API_URL : b.API_URL;

        loadScript(url + queryStr, function (t) {
            p.set("_iwt_id", t);
        });
    }

    var f = [], // 存放 flash打点cb
        d = [], // 存放 jsonp打点cb
        h = getUniqueId(),
        p = {
            // loading: undefined, // 1 
            // swf: null, 
            SWF_URL: "http://irs01.net/MTFlashStore.swf#",
            _available: 1, // 标识flash是否可用，初始值为1，表示可用，之后还得检测
            // inited: undefined, // 1 表示flash加载成功
            _jpf: h,
            get: function (key, e) {
                return p._sendFlashMsg(e, "jGetItem", key)
            },
            set: function (key, val, i) {
                return p._sendFlashMsg(i, "jSetItem", key, val)
            },
            _sendFlashMsg: function (e, swfMethodName, key, val) {
                e = e || l;
                var r = getUniqueId(),
                    lens = arguments.length,
                    s = p.swf; // swf 
                window[r] = e;
                2 == lens ? s[swfMethodName](r) : 3 == lens ? s[swfMethodName](key, r) : s[swfMethodName](key, val, r);
            },
            initSWF: function (flashHandler, jsonpHandler) {
                return p._available ? 
                    p.inited ? 
                        flashHandler && setTimeout(flashHandler, 0) : 
                        (flashHandler && f.push(flashHandler), jsonpHandler && d.push(jsonpHandler), p.loading || initSwf(), void 0) : 
                    jsonpHandler && jsonpHandler();
            }
        },
        v = "_iwt_cid=",
        m = location.search.indexOf(v),
        _ = m > -1 ? location.search.slice(m + v.length).split("&", 1)[0] : "",
        b = {
            FC: p,
            API_URL: "http://irs01.com/irt?",
            track: function (option, cb) {
                option.NO_FLS ? 
                    scriptLog(option, cb) : 
                    p.initSWF(function () { 
                        p.get("_iwt_id", function (i) { scriptLog(option, cb, i) }) 
                    }, function () { 
                        scriptLog(option, cb) 
                    });
            }
        };

    window._iwt = b;

    if (window._iwtTQ) {
        for (var g, w = window._iwtTQ; g = w.shift();) {
            b.track(g[0], g[1]);
        }
    }

})(this, document);



