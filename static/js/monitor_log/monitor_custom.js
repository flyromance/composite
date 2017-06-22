/*
  @description: weblog 打点
  @author:      李兴，zyc
  @update:
    2017/02/08  如果节点有数据，但是不可见，就不打点
    2-17/04/12  给 duration 打点增加了 guid，之前的逻辑 guid 是从 data-log 中取的，有可能取不到。
*/

window.monitorObj = (function($, window) {
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
    var ObjectH = {
        getType: function getConstructorName(o) {
            //加o.constructor是因为IE下的window和document
            if (o != null && o.constructor != null) {
                return Object.prototype.toString.call(o).slice(8, -1);
            } else {
                return '';
            }
        }
    };


    var common = {
        isUrl: function IsURL(str_url) {
            var regexp = /((http|ftp|https|file):\/\/([\w\-]+\.)+[\w\-]+(\/[\w\u4e00-\u9fa5\-\.\/?\@\%\!\&=\+\~\:\#\;\,]*)?)/ig;
            return str_url.match(regexp) ? true : false;
        },
        getType: function getConstructorName(o) {
            //加o.constructor是因为IE下的window和document
            if (o != null && o.constructor != null) {
                return Object.prototype.toString.call(o).slice(8, -1);
            } else {
                return '';
            }
        },
        getContainId: function(el) {
            var name = null;
            while (el) {
                //bk模式
                if (el.attributes && ('bk' in el.attributes || 'data-bk' in el.attributes)) {
                    name = el.getAttribute('bk') || el.getAttribute('data-bk');
                    if (name) {
                        name = 'bk:' + name;
                        return name.substr(0, 100);
                    }
                }
                if (el.id) {
                    name = el.getAttribute('data-desc') || el.id;
                    return name.substr(0, 100);
                }
                el = el.parentNode;
            }
            return null;
        },
        getHref: function(el) {
            try {
                return el.getAttribute('data-href') || el.href || '';
            } catch (e) {
                return '';
            }
        },
        getParentNode: function(el, elParentTagName, deep) {
            deep = deep || 5;
            while (deep > 0) {
                var tagName = elParentTagName.toUpperCase();
                try {
                    if (tagName === el.tagName) {
                        return el;
                    }
                } catch (e) {
                    return null;
                }
                el = el.parentNode;
                deep--;
            }
            return null;
        },
        getClickParm: function(e) {
            e = EventH.fix(e);
            var target = e.target,
                tagName = target.tagName,
                cid = this.getContainId(target);
            if (target.type && (target.type == 'submit' || target.type == 'button')) {
                var form = this.getParentNode(target, 'FORM'),
                    result = {};
                if (form) {
                    if ($(form).parent('.search-form').length > 0) {
                        return {
                            cid: cid,
                            keyword: $('#kw').val(),
                            type: 'search'
                        };
                    }
                }
            } else {
                target = this.getParentNode(target, 'A');
                if (target) {
                    var url = this.getHref(target);
                    if (common.isUrl(url)) {
                        var bk = cid.indexOf('bk:') >= 0 ? cid.substr(3) : "";
                        return { cid: cid, 'type': 'click', link_list: [{ link: this.getHref(target) }], link_type: linkTypeObj[bk] || ($(this).parents('#subCont').length ? 7 : 8) };
                    }

                }
            }
            return false;
        }
    };
    var log = {
        buildLog: function(para) {
            var weblogApi = "http://click.btime.com/api/weblog";
            var log = { content: para }; //必须为Array

            for( var i = 0, len = para.length; i < len; i++ ) {
                var data = JSON.parse(para[i]);
                data.from = defaultConf.from;
                para[i] = JSON.stringify(data);
                window.__btime_monitor_imgs = {};
                var id = 'log_' + new Date().getTime(),
                    img = window['__btime_monitor_imgs'][id] = new Image(),
                    data='content[]='+encodeURIComponent(para[i]);

                img.onload = img.onerror = function() {
                    if(window.__btime_monitor_imgs && window['__btime_monitor_imgs'][id]) {
                        window['__btime_monitor_imgs'][id] = null;
                        delete window["__btime_monitor_imgs"][id];
                    }
                };
                img.src = weblogApi + '?' + data;
            }

        }
    };

    function share($obj) {
        var shareType = { "微信扫码分享": '6', "分享到新浪微博": '0', "分享到ＱＱ空间": '2', "分享到豆瓣网": '3', "分享到人人网": '4' },
            title = $obj.attr("title") || $obj[0].innerText,
            item = { share_type: shareType[title] || '', action: 'share' },
            json = {};
        return item;
    }

    function comment(cid, $obj) {
        var json = {};
        if (cid == 'qh-latest-list-wrap') {
            var div = common.getParentNode($obj[0], "DIV");
            if (!$(div).attr("data-cmt-id")) {
                return;
            }
            json = { target_comment_id: $(div).attr("data-cmt-id"), action: 'comment' };
            return json;
        } else if (cid == 'QIHOO360COMMENTMX') {
            var span = common.getParentNode($obj[0], "SPAN");
            if (!span) {
                return;
            }
            var $replydiv = $obj.parents('.qh-cmt').find('.qh-cmt-reply');
            if (!$replydiv.length) {
                return;
            }
            var rpId = $replydiv.attr('data-reply-pid');
            json = { target_comment_id: rpId, action: 'comment' };
            return json;
        } else if (cid == 'comment-qh') {
            var a = common.getParentNode($obj[0], "A");
            if (!a) {
                return;
            }
            if ($('#' + cid).find('textarea').val() !== '') {
                json = { action: 'comment' };
                return json;
            }
        }
    }

    function belowthefold(element, settings) {
        var fold, $window = $(window);
        fold = (window.innerHeight ? window.innerHeight : $window.height()) + $window.scrollTop();
        return fold <= $(element).offset().top - settings.threshold;
    }

    function rightoffold(element, settings) {
        var fold, $window = $(window);
        fold = $window.width() + $window.scrollLeft();
        return fold <= $(element).offset().left - settings.threshold;
    }

    function abovethetop(element, settings) {
        var fold, $window = $(window);
        fold = $window.scrollTop();
        return fold >= $(element).offset().top + settings.threshold + $(element).height();
    }

    function leftofbegin(element, settings) {
        var fold, $window = $(window);
        fold = $window.scrollLeft();
        return fold >= $(element).offset().left + settings.threshold + $(element).width();
    }

    function inviewport(element, settings) {
        return !rightoffold(element, settings) && !leftofbegin(element, settings) &&
            !belowthefold(element, settings) && !abovethetop(element, settings);
    }

    function cal() {
        var arr = [],
            adArr = [];
        $('[data-log], [data-gid]').each(function(i, item) {
            var $item = $(item),
                is_read = $item.attr('data-read'),
                gid = '',
                is_ad = $item.attr('ad_track');
            if (!is_read && !is_ad) {

                if ($item.is(':visible') && inviewport(item, { threshold: 0 })) {
                    var log = $item.attr('data-log') || '';
                    if (!log.length && window.weblogMap) {
                        gid = $item.data('gid') || $item.parents('[data-gid]').data('gid');
                        log = window.weblogMap[gid];
                    }
                    var json = {};

                    if(!$item.is('[adview-id]')) {
                        try {
                            json = JSON.parse(log);
                            json.bk = $item.parents('[bk]').attr('bk');
                            json.action = 'view';
                            json.ts = +new Date;
                            json.referer = window.location.href;
                            var log = JSON.stringify(json);
                            arr.push(log);
                            $item.attr('data-read', 1);
                            if(gid.length) {
                                $item.removeAttr('data-log');
                            }
                        } catch (e) {}

                    }


                }
            }
        });

        // 百度贴片展示打点
        $('[data-rendered]').each(function(i, item) {
            var $item = $(item);
            is_read = $item.attr('data-read');
            if (!is_read) {
                if ($item.is(':visible') && inviewport(item, { threshold: 0 })) {
                    adArr.push(AdViewTrackPar('百度贴片', $item.attr('id')));
                    $item.attr('data-read', 1);
                }
            }
        });
        if (adArr.length) {
            log.buildLog(adArr);
        }
        return arr;
    }
    //计算新闻阅读百分比
    function CalNewsReadPercentage() {
        var $content = $('.content-text'),
            scrollTop = $(window).scrollTop(),
            top = $content.offset().top,
            height = $content.height(),
            percentage = 0,
            clientHeight = $(window).height(),
            total = top + height;
        if (total < scrollTop + clientHeight) {
            percentage = 1;
        } else {
            if (top <= scrollTop) {
                percentage = (scrollTop - top + clientHeight) / height;
            } else if (top > scrollTop && top < scrollTop + clientHeight) {
                percentage = (scrollTop + clientHeight - top) / height;
            } else {
                percentage = 0;
            }
        }
        return percentage;
    }

    function View() {
        var arr = cal();
        if (arr.length) {
            log.buildLog(arr);
        }
        var ad_arr = AdViewCal();
        if (ad_arr.length) {
            log.buildLog(ad_arr);
        }
    }

    function AdViewCal() {
        var arr = [];
        $('[ad_track]').each(function(i, item) {
            var $item = $(item);
            var is_read = $item.attr("data-read");
            if (!is_read) {
                if ($item.is(':visible') && inviewport(item, { threshold: 0 })) {

                    var bk = $item.attr('bk') || ($item.parents('[bk]').length && $item.parents('[bk]').attr('bk')) || '',
                        tkval = $item.attr('ad_track'),
                        log = '';
                    // 猜你爱购需要区域打点，使用 ad_track == 2 来区分这种情况。
                    if(tkval == 2) {
                        var urlarr = [];
                        $item.find('.js-track-sub').each(function () {
                            var linkarr = decodeURIComponent(decodeURIComponent($(this).attr('href'))).split('url=');
                            urlarr.push(linkarr[linkarr.length-1]);
                        });
                        log = AdViewTrackPar(bk, urlarr.join(','));
                        arr.push(log);
                    } else {
                        var ad_url = item.tagName == "A" ? $item.attr('href') : ($item.find('a').length && $item.find('a').attr('href') || '');
                        if(!(tkval == 'weblogignore')) {
                            log = AdViewTrackPar(bk, ad_url);

                            var datalog = null;
                            $parlog = ($item.data('log') && $item) || ($item.parents('[data-log]').attr('data-log') && $item.parents('[data-log]'));
                            $pargid = ($item.data('gid') && $item) || ($item.parents('[data-gid]').attr('data-gid') && $item.parents('[data-gid]'));

                            if ($parlog) {
                                datalog = $parlog.attr('data-log');
                            } else if ($pargid) {
                                datalog = window.weblogMap[$pargid.attr('data-gid')];
                            }

                            // cpm 投放的广告位上有 data_log，需要把信息透传上去
                            if(datalog) {
                                var templog = $.extend(JSON.parse(log), JSON.parse(datalog));
                                log = JSON.stringify(templog);
                            }
                            arr.push(log);
                        }
                    }


                    $item.attr('data-read', 1);
                    // mv 的打点统计触发事件也放到这里，触发时机相同。
                    $(window).trigger('monitor.mvshowreq', $item);
                }
            }
        });

        return arr;
    }

    function AdViewTrackPar(bk, url) {
        var id;
        if (!defaultConf.isChannel) {
            id = JSON.parse(monitorObj.basePar).uid;
        } else {
            id = GetLogBase().uid;
        }
        var json = { action: 'ad_view', ts: +new Date, pid: defaultConf.pid, cid: 'bk:' + bk, link_type: 9, type: (defaultConf.isChannel ? defaultConf.pid : defaultConf.twoChannel), id: id ,referer:window.location.href};
        json.link_list = url && [url] || [];
        var log = JSON.stringify(json);
        return log;
    }

    // 针对 cpm 需要透传 slog，增加了一个参数 slogdata
    function AdClickTrack(cid, url, slogdata) {
        var id;
        if (!defaultConf.isChannel) {
            id = JSON.parse(monitorObj.basePar).uid;
        } else {
            id = GetLogBase().uid;
        }
        var json = { pid: defaultConf.pid, cid: cid, link_type: 9, type: (defaultConf.isChannel ? defaultConf.pid : defaultConf.twoChannel), action: "ad_click", ts: +new Date, id: id };

        if(slogdata) {
            $.extend(json, slogdata);
        }
        json.link_list = [url];
        log.buildLog([JSON.stringify(json)]);
    }

    function bandclick() {
        $(document).on('mousedown', function(e) {
            e = EventH.fix(e);
            var cid = common.getContainId(e.target),
                $obj = $(e.target),
                dataPara = {};

            // 百度贴片的点击打点，如果使用了 shadow dom，就找他父节点的 id，作为关键字
            if($obj.parents('[data-rendered]').length) {
                if($obj[0].tagName == 'A') {
                    if( !$obj.attr('class') || $obj.attr('class').indexOf('close') == -1 ) {
                        var url = $obj.attr('href');
                        AdClickTrack('bk:百度贴片', url);
                    }
                } else {
                    AdClickTrack('bk:百度贴片', $obj.parents('[data-rendered]').attr('id'));
                }
            }


            var $par = null,
                clickPar = '',
                $parlog = ($obj.data('log') && $obj) || ($obj.parents('[data-log]').attr('data-log') && $obj.parents('[data-log]')),
                $pargid = ($obj.data('gid') && $obj) || ($obj.parents('[data-gid]').attr('data-gid') && $obj.parents('[data-gid]'));

            if ($parlog) {
                $par = $parlog;
                clickPar = $parlog.attr('data-log');
            } else if ($pargid) {
                $par = $pargid;
                clickPar = window.weblogMap[$pargid.attr('data-gid')];
            }

            // var $par = $obj.parents('[data-log]'),
            //     $par = ($par.length && $par) || ($obj.attr('data-log') && $obj) || '',
            //clickPar = ($par && $par.attr('data-log')) || '',
            var json = {};


            // 有些广告位有 data-log，但是不应该触发 view 而是触发 ad_view，用 adview-id 过滤
            if (clickPar && !$obj.attr('ad_track') && !($par.attr('adview-id') || $par.attr('ad_track'))) {
                try {
                    json = JSON.parse(clickPar);
                } catch (error) {
                    return;
                }
                json.action = 'click';
                json.bk = $obj.parents('[bk]').attr('bk');
                json.ts = +new Date();
                clickPar = JSON.stringify(json);
                log.buildLog([clickPar]);

            } else {
                var baseJsonStr = monitorObj.basePar;
                switch (cid) {
                    case "bk:share":
                        json = share($obj);
                        if (json) {
                            try {
                                json = $.extend(true, JSON.parse(baseJsonStr), json);
                                log.buildLog([JSON.stringify(json)]);
                            } catch (error) {}
                        }
                        break;
                    case "qh-latest-list-wrap":
                    case "QIHOO360COMMENTMX":
                    case "comment-qh":
                        json = comment(cid, $obj);
                        if (json) {
                            try {
                                json = $.extend(true, JSON.parse(baseJsonStr), json);
                                log.buildLog([JSON.stringify(json)]);
                            } catch (error) {}

                        }
                        break;
                    case "suggest-common":
                    case "search-form":
                        var keyword = '';
                        if (cid == 'search-form') {
                            keyword = $('#' + cid).find('#haosou-input').val();
                        } else {
                            var $a = $(common.getParentNode($obj[0], 'A'));
                            keyword = $a.attr('data-text');
                        }
                        if (keyword) {
                            try {
                                json = { keyword: keyword, action: 'search' };
                                var base = {};
                                if (baseJsonStr) {
                                    var jsonbase = JSON.parse(baseJsonStr);
                                    base = { mid: jsonbase.mid, guid: jsonbase.guid, uid: jsonbase.uid, client_id: jsonbase.client_id, net: jsonbase.net };
                                } else {
                                    base = GetLogBase();
                                }
                                json = $.extend(true, json, base);
                                log.buildLog([JSON.stringify(json)]);
                            } catch (error) {

                            }
                        }
                        break;
                    default:
                        var $a = $(common.getParentNode($obj[0], 'A'));
                        if ($a.length) {
                            if ($a.attr('ad_track') || $a.parents('[ad_track]').length) { //广告
                                var url = $a.attr('href');

                                // var $adlogdom = $a.parents('[data-log]');
                                // var slogdata = {};
                                // // cpm 投放的广告位上有 data_log，需要把信息透传上去
                                // if($adlogdom.length && $adlogdom.data('log')) {
                                //     slogdata = JSON.parse($adlogdom.data('log'));
                                // }


                                var $datalog = ($a.data('log') && $a) || ($a.parents('[data-log]').attr('data-log') && $a.parents('[data-log]')),
                                    $datagid = ($a.data('gid') && $a) || ($a.parents('[data-gid]').attr('data-gid') && $a.parents('[data-gid]')),
                                    slogdata = {};

                                if ($parlog) {
                                    slogdata = JSON.parse($parlog.attr('data-log'));
                                } else if ($pargid) {
                                    slogdata = JSON.parse(window.weblogMap[$pargid.attr('data-gid')]);
                                }
                                AdClickTrack(cid, url, slogdata);

                                // 点击的节点以及其父节点上有 data-click_req , 说明需要触发 mv 的点击打点
                                var $item;
                                if ($a.data('click_req')) {
                                    $item = $a;
                                } else if ($a.parents('[ad_track]').data('click_req')) {
                                    $item = $a.parents('[ad_track]');
                                }
                                $(window).trigger('monitor.mvclkreq', $item);
                            }
                        }
                        break;
                }
            }
        });

    }

    function VideoMonitor(basePar) {
        var vvMonitor = (function() {
            return {
                contain: {},
                post: function(detailJson) {
                    var ts = +new Date;
                    var json = basePar;
                    try {
                        json = JSON.parse(json);
                        json.action = 'video_seq';
                        json.stream_vbt = '高清';
                        json.ts = ts;
                        json = $.extend(true, json, detailJson);
                    } catch (e) {
                        return;
                    }
                    var jsonStr = JSON.stringify(json);
                    log.buildLog([jsonStr]);
                },
                vStart: function() {
                    var that = this;
                    that.post({ 'type': 'start', 'pt': 0 });
                },
                vPlaying: function(pt) {
                    var that = this;
                    that.post({ 'type': 'playing', 'pt': pt });
                },
                vPlay: function(pt) {
                    var that = this;
                    that.post({ 'type': 'play', 'pt': pt });
                },
                vPause: function(pt) {
                    var that = this;
                    that.post({ 'type': 'pause', 'pt': pt });
                },
                vStop: function(pt) {
                    var that = this;
                    that.post({ 'type': 'stop', 'pt': pt });
                }
            };
        })();
        window.onPlayerEvent = function(event, params) {
            var jsonC = eval('(' + params + ')');
            var num = Math.floor(jsonC.videoCurrentTime);
            if (jsonC.type == "replay") {
                switch (event) {
                    case "videoupdate":

                        if (jsonC.videoTotalTime && event == "videoupdate" && num % 5 == 0 && ((vvMonitor.contain[jsonC.videoId] != undefined && vvMonitor.contain[jsonC.videoId] != num) || vvMonitor.contain[jsonC.videoId] == undefined)) {
                            if (num !== 0) {
                                vvMonitor.vPlaying(num);
                            } else {
                                vvMonitor.vStart();
                            }
                            vvMonitor.contain[jsonC.videoId] = num;
                        }
                        break;
                    case "videostop":
                        vvMonitor.vStop(num);
                        App && App.playnext && App.playnext(); //如果有自动播放下个视频，就播放
                        break;
                    case "videopause":
                        vvMonitor.vPause(num);
                        break;
                    case "videoplay":
                        vvMonitor.vPlay(num);
                        break;
                }
            }
        };
    }

    function ExtendJson() {
        if (!window.JSON) {
            window.JSON = {
                parse: function(sJSON) {
                    return eval('(' + sJSON + ')');
                },
                stringify: (function() {
                    var toString = Object.prototype.toString;
                    var isArray = Array.isArray || function(a) {
                        return toString.call(a) === '[object Array]';
                    };
                    var escMap = { '"': '\\"', '\\': '\\\\', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t' };
                    var escFunc = function(m) {
                        return escMap[m] || '\\u' + (m.charCodeAt(0) + 0x10000).toString(16).substr(1);
                    };
                    var escRE = /[\\"\u0000-\u001F\u2028\u2029]/g;
                    return function stringify(value) {
                        if (value == null) {
                            return 'null';
                        } else if (typeof value === 'number') {
                            return isFinite(value) ? value.toString() : 'null';
                        } else if (typeof value === 'boolean') {
                            return value.toString();
                        } else if (typeof value === 'object') {
                            if (typeof value.toJSON === 'function') {
                                return stringify(value.toJSON());
                            } else if (isArray(value)) {
                                var res = '[';
                                for (var i = 0; i < value.length; i++)
                                    res += (i ? ', ' : '') + stringify(value[i]);
                                return res + ']';
                            } else if (toString.call(value) === '[object Object]') {
                                var tmp = [];
                                for (var k in value) {
                                    if (value.hasOwnProperty(k))
                                        tmp.push(stringify(k) + ': ' + stringify(value[k]));
                                }
                                return '{' + tmp.join(', ') + '}';
                            }
                        }
                        return '"' + value.toString().replace(escRE, escFunc) + '"';
                    };
                })()
            };
        }
    }

    function GetLogBase() {
        var dataInfo = $($('[data-log]')[0]).attr('data-log'),
            base = {};
        try {
            if (!dataInfo) {
                dataInfo = $($('[data-read]')[0]).attr('data-log');
            }
            var jsonbase = JSON.parse(dataInfo);
            base = { mid: jsonbase.mid, guid: jsonbase.guid, uid: jsonbase.uid, client_id: jsonbase.client_id, net: jsonbase.net };
        } catch (e) {

        }
        return base;
    }

    function LeaveTime(jsonConf) {
        var now = +new Date,
            start = window.G_start_time.getTime();
        leaveTime = Math.floor((now - start) / 1000);
        var json = { action: 'duration', ts: now, duration: leaveTime ,referer:window.location.href};
        json = $.extend(true, json, jsonConf, GetLogBase(), {guid: monitor.util.getGuid()});
        log.buildLog([JSON.stringify(json)]);
    }
    var defaultConf = {
        isChannel: true,
        pid: '',
        from:""
    };
    return {
        readPercentage: 0,
        basePar: '',
        init: function(conf) {
            ExtendJson();
            setInterval('monitorObj.track()', 1000);
            var that = this;
            defaultConf = $.extend(true, defaultConf, conf || {});
            if (defaultConf.isChannel) {
                //频道页
                if (window.App && window.App.router && window.App.router.channel) {
                    setInterval('monitorObj.LeaveTimeTrack()', 5000);
                    $(window).on("beforeunload", function() {
                        that.LeaveTimeTrack();
                    });
                }
                //视频频道视频打点
                $(document.body).on('clickPar', function(e, obj) {
                    var json_log = obj && obj.s_log && JSON.stringify(obj.s_log) || '';
                    if (json_log) {
                        VideoMonitor(json_log);
                    }
                });
                //切换二级频道打当前频道停留时间打点
                $(document.body).on('tabSecondChannelTrack', function() {
                    that.LeaveTimeTrack();
                });
            } else {
                var baseData=JSON.parse(conf.baseLog);
                if(!baseData.guid){
                    baseData.guid=conf.guid;
                }
                that.basePar =JSON.stringify(baseData);
                VideoMonitor(that.basePar);
                //直播气泡打点
                $(document.body).on('bubble_click', function() {
                    var data = $('.heart-btn').attr("data-emoji-type") || 1;
                    var json = JSON.parse(that.basePar);
                    json.action = 'bubble_click';
                    json.bubble_type = data;
                    json.ts = +new Date;
                    log.buildLog([JSON.stringify(json)]);
                });
            }
            bandclick();
            if ($('.content-text').length) {
                window.ReadPercentageInter = setInterval('monitorObj.CalNewsReadPercentage()', 2000);
            }
        },
        track: View,
        CalNewsReadPercentage: function() {
            var percentage = new Number(CalNewsReadPercentage()).toFixed(2);
            var that = this;
            if (percentage > that.readPercentage) {
                that.readPercentage = percentage;
                var ts = +new Date;
                var json = that.basePar;
                try {
                    json = JSON.parse(json);
                } catch (e) {
                    return;
                }
                json = $.extend(true, json, { action: 'detail', percent: percentage, ts: ts });
                log.buildLog([JSON.stringify(json)]);
            }
            if (percentage == 1.00 || ((ts - window.G_start_time.getTime()) / 1000) > 300) {
                window.clearInterval(ReadPercentageInter);
            }
        },
        LeaveTimeTrack: function() {
            var channel = window.App.router.channel_cid;
            LeaveTime({ channel_id: channel });
        }
    };
})(jQuery, window);
