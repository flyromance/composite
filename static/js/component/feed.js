/**
 * @update
 * (2017/02/10)  by zyc  在获取到数据后，调用方法，把打点用的信息放到 weblogMap 中。
 */
; (function () {

    // 浅层扩展，支持：全覆盖、替换目标没有的属性
    function mix(target, source, map) {

        // target上没有key, 或者target上的key不存在
        map = map || function (t, s, key) {
            if (!(target[key] || (key in target))) {
                return s;
            }
            return t;
        };

        if (map === true) { // override
            map = function (t, s) {
                return s;
            }
        }

        for (var key in source) {
            target[key] = map(target[key], source[key], key);
            if (target[key] === 'undefined') {
                delete target[key];
            }
        }

        return target;
    }

    // 创建自定义事件
    function createEvent(obj) {
        var event = {};

        mix(obj, {
            on: function (eventType, fn) {
                event[eventType] = event[eventType] || [];
                event[eventType].push(fn);
            },
            fire: function (eventType, arg) {
                var i,
                    handlers = event[eventType] || [],
                    lens = handlers.length;
                arg = arg || {};

                $.extend(arg, {
                    target: obj,
                    type: eventType,
                    preventDefault: function () {
                        arg.returnValue = false;
                    }
                });

                for (i = 0; i < lens; i++) {
                    handlers[i](arg);
                    if (arg.returnValue === false) {
                        break;
                    }
                }
            }
        });

        obj.trigger = obj.fire;
        obj.bind = obj.on;

        return obj;
    }

    // 推荐加载功能
    var Remind = (function () {
        function Remind(parent) {
            this.parent = parent;
            this.conf = this.parent.conf;
            this.init();
        }

        Remind.prototype = {
            constructor: Remind,
            init: function () {
                var that = this;

                that.marginTop = that.conf.marginTop || 0; // 未读提醒，悬停，离顶部距离
                that.fixedIndex = that.conf.fixedIndex || 100; // 未读提醒，悬停，层级
                that.toTop = that.conf.toTop || 0; // 未读提醒，点击xx分钟前，滚动条需要滚动到的位置
                that.remindTime = that.conf.remindTime || 5; // 推荐时间
                that.updateTime = that.conf.updateTime || 1; // 1分钟更新一次
                that.hasReminded = false; // 有没有推荐过
                that.loading = false; // 请求中
                that.$container = that.parent.$container;
                that.$unread = null;
                that.alert = {
                    unread: that.conf.alertUI.unread,
                    refresh: that.conf.alertUI.refresh
                };

                createEvent(that); // 给that对象添加自定义事件方法
                that.bindEvent(); // 绑定事件

                that.trigger('startRemind'); // 开始
            },
            transformTime: function (minute) {
                var hour = minute / 60,
                    _ret = '';
                minute = minute ? minute : 1;

                if (hour > 0 && hour <= 1) {
                    _ret = Math.floor(minute) + '分钟';
                } else if (hour > 1 && hour <= 24) {
                    _ret = Math.floor(hour) + '小时';
                } else {
                    _ret = 24 + '小时';
                }

                return _ret;
            },
            setLoadingState: function (flag) {
                this.loading = flag;
            },
            stopRemind: function () {
                this.trigger('stopRemind');
            },
            startRemind: function () {
                this.trigger('startRemind');
            },
            reloadRefresh: function () {
                this.trigger('stopRefresh');
                this.trigger('startRefresh');
            },
            bindEvent: function () {
                var that = this;

                that.bind('startRemind', function () {
                    that.unreadTimer && clearInterval(that.timer);
                    that.unreadTimer = setInterval(function () {
                        that.trigger('showUnread');
                    }, that.remindTime * 60 * 1000);
                });

                that.bind('stopRemind', function () {
                    clearInterval(that.unreadTimer);
                    that.unreadTimer = null;
                });

                that.bind('showUnread', function () {

                    // 没有未读才创建未读
                    if (that.$unread === null) {
                        that.$unread = $(that.alert.unread); // 创建未读
                        that.$unread.prependTo(that.$container); // 插入到dom

                        // 未读提醒：悬停配置
                        if (that.marginTop !== undefined) {
                            that.$unread.scrollToFixed({
                                marginTop: that.marginTop,
                                zIndex: that.fixedIndex
                            });
                        }

                        // 绑定未读点击事件
                        that.$unread.one('click', function (e) {
                            if (that.$container.find('.scroll-to-fixed-fixed').length) {
                                $(window).scrollTop(that.toTop); // 回到顶部
                            }
                            setTimeout(function () {
                                that.trigger('removeUnread');
                                that.trigger('startLoad');
                            }, 10);
                        }).find('.j-unread-close').one('click', function (e) {
                            e.stopPropagation();
                            that.trigger('removeUnread');
                        });
                    }
                });

                that.bind('removeUnread', function () {
                    that.$unread && that.$unread.length && that.$unread.remove();
                    that.$unread = null;
                });

                that.bind('startLoad', function () {
                    that.loading = true;
                    that.parent.trigger('load_data', { // 触发父级的加载事件
                        strategy: 'remind'
                    });
                });

                that.bind('startRefresh', function () {
                    that.refreshTimer && clearInterval(that.refreshTimer);
                    that.refreshTimer = setInterval(function () {
                        that.trigger('updateTime');
                    }, that.updateTime * 60 * 1000);
                });

                that.bind('updateTime', function () {
                    var $item = that.$container.find('.j-alert-refresh');
                    var _time = +$item.data('time') || 1;
                    var _text = that.transformTime(_time);
                    $item.find('.j-refresh-time').text(_text);
                    $item.data('time', _time + 1);
                });

                that.bind('stopRefresh', function (e) {
                    clearInterval(that.refreshTimer);
                    that.refreshTimer = null;
                });

                // 点击刷新，回到顶部，提示正在加载
                that.$container.on('click', '.j-alert-refresh', function (e) {
                    e.stopPropagation();
                    $(window).scrollTop(that.toTop); // 回到顶部
                    that.trigger('removeUnread');
                    that.trigger('startLoad');
                });
            }
        };

        return Remind;
    })();

    // 滚动加载功能
    var Scroll = (function () {
        function Scroll(parent) {
            this.parent = parent;
            this.conf = {
                uniqueTag: this.parent.conf.uniqueTag,
                thresholdVal: this.parent.conf.thresholdVal,
                thresholdTime: this.parent.conf.thresholdTime
            };
            this.init();
        }

        Scroll.prototype = {
            constructor: Scroll,
            init: function () {
                var that = this;

                that.$container = that.parent.$container; // 容器
                that.scrollLoadName = 'scroll.infoFlow.' + that.conf.uniqueTag; // 标识滚动事件，方便解绑
                that.bindEvent();
            },
            offEvent: function () {
                var that = this;

                $(window).off(that.scrollLoadName);
            },
            bindEvent: function () {
                var that = this;

                // 滚动加载事件
                $(window).on(that.scrollLoadName, that.throttle(function (e) {
                    if (!that.loading) {
                        that.handleScroll(e);
                    }
                })).trigger(that.scrollLoadName);
            },
            setLoadingState: function (flag) {
                this.loading = flag;
            },
            handleScroll: function (e) {
                var that = this;

                var $win = $(window),
                    wt = $win.scrollTop(),
                    wh = $win.height(),
                    total_height = that.$container.offset().top + that.$container.outerHeight(),
                    threshold = that.conf.thresholdVal;

                if (wt + wh > total_height - threshold) {
                    that.loading = true;
                    that.parent.trigger('load_data', {
                        strategy: 'scroll'
                    });
                }
            },
            throttle: function (fun) {
                var that = this;

                var timer,
                    scrollThresholdTime = that.conf.thresholdTime;

                return function () {
                    var that = this,
                        args = arguments;

                    clearTimeout(timer);
                    timer = setTimeout(function () {
                        fun.apply(that, args);
                    }, scrollThresholdTime)
                }
            }
        };

        return Scroll;
    })();

    // 综合功能
    var createInfoFlow = function (conf) {

        // 私有变量, 外部无法改变, 只能通过接口函数改变

        function InfoFlow(conf) {
            this.init(conf);
        }

        InfoFlow.prototype = {
            constructor: InfoFlow,
            init: function (conf) {
                var that = this;

                that.conf = conf;
                that.container = conf.container;
                that.$container = $(conf.container);
                that.alert = {
                    loading: conf.alertUI.loading,
                    result: conf.alertUI.result
                };

                // 顶部推荐点击加载
                that.remind = {
                    page: 0,
                    hasData: true,
                    api: null,
                    module: that.conf.hasRemindLoad ? new Remind(that) : null
                };

                createEvent(that); // 创建自定义事件, 给that添加on、off方法
                that.bindEvent(); // 绑定自定义事件

                // 处理第一屏数据不用发送请求的情况; 放在实例化scroll之前
                if (that.conf.hasFirstPageData) {
                    that.handleIndex();
                }

                // 滚动加载
                that.scroll = {
                    page: 0,
                    hasData: true,
                    api: null,
                    module: that.conf.hasScrollLoad ? new Scroll(that) : null
                };

                that.setAPI(); // 配置请求接口
            },
            setAPI: function () {
                var that = this;

                var scrollLoadConf, remindLoadConf;

                // 赋值操作，顺便判断有无
                if (that.conf.hasScrollLoad) {
                    scrollLoadConf = $.extend(true, {}, that.conf.baseLoad, that.conf.scrollLoad);
                    that.scroll.api = {};
                    that.scroll.api.baseUrl = scrollLoadConf.baseUrl;
                    that.scroll.api.urlParam = scrollLoadConf.urlParam || {};
                    that.scroll.api.urlParam[scrollLoadConf.pagingName] = 0;
                    that.scroll.api.pagingName = scrollLoadConf.pagingName || 'page'; // 设置分页参数
                    that.scroll.api.timestamp = scrollLoadConf.timestamp; // 时间戳

                    if (scrollLoadConf.countName && scrollLoadConf.countNum) { // 设置每页返回数据的条数
                        that.scroll.api.urlParam[scrollLoadConf.countName] = scrollLoadConf.countNum;
                    }
                }

                if (that.conf.hasRemindLoad) {
                    remindLoadConf = $.extend(true, {}, that.conf.baseLoad, that.conf.remindLoad);
                    that.remind.api = {};
                    that.remind.api.baseUrl = remindLoadConf.baseUrl;
                    that.remind.api.urlParam = remindLoadConf.urlParam || {};
                    that.remind.api.urlParam[remindLoadConf.pagingName] = 0;
                    that.remind.api.pagingName = remindLoadConf.pagingName || 'page';
                    that.remind.api.timestamp = remindLoadConf.timestamp; // 时间戳

                    if (remindLoadConf.countName && remindLoadConf.countNum) { // 设置每页返回数据的条数
                        that.remind.api.urlParam[remindLoadConf.countName] = remindLoadConf.countNum;
                    }
                }
            },
            handleIndex: function () {
                var that = this;

                // 处理首屏已有数据（不用请求的情况)
                that.handleData({
                    page: ++that.remind.page, // 有首屏数据，推荐次数加1
                    strategy: 'remind',
                    resData: that.conf.firstPageData
                });
            },
            beforeFetchData: function (strategy) {
                var that = this;

                if (strategy == 'scroll') {
                    that.scroll.module.setLoadingState(true);
                    that.scroll.$loading = $(that.alert.loading);
                    that.$container.append(that.scroll.$loading);
                    that.scroll.api.urlParam[that.scroll.api.pagingName] = ++that.scroll.page;

                    if (that.scroll.api.timestamp) { // 设置时间戳
                        that.scroll.api.urlParam[that.scroll.api.timestamp] = +new Date();
                    }
                    that.fetchData(that.scroll.api, 'scroll');
                } else if (strategy == 'remind') {
                    that.remind.module.setLoadingState(true);
                    that.remind.$loading = $(that.alert.loading);
                    that.$container.prepend(that.remind.$loading);
                    that.remind.api.urlParam[that.remind.api.pagingName] = ++that.remind.page;

                    if (that.remind.api.timestamp) { // 设置时间戳
                        that.remind.api.urlParam[that.remind.api.timestamp] = +new Date();
                    }
                    that.fetchData(that.remind.api, 'remind');
                }
            },
            fetchData: function (api, strategy) {
                var that = this;

                $.ajax({
                    type: 'get',
                    url: api.baseUrl,
                    data: api.urlParam,
                    dataType: 'jsonp'
                }).done(function (res, jqAjax) {
                    var obj = {
                        channel: that.conf.uniqueTag,
                        module: that,
                        resData: res,
                        jqAjax: jqAjax,
                        strategy: strategy,
                        page: strategy == 'scroll' ? that.scroll.page : that.remind.page,
                        hasDislike: that.conf.hasDislike ? true : false
                    };
                    // add by zyc
                    $utils.setWeblogMonitorMap(res.data);
                    that.afterFetchData(obj);
                }).fail(function (res, jqAjax) {
                    var obj = {
                        channel: that.conf.uniqueTag,
                        module: that,
                        resData: res,
                        jqAjax: jqAjax,
                        strategy: strategy,
                        page: strategy == 'scroll' ? that.scroll.page : that.remind.page,
                        hasData: false
                    };

                    that.afterFetchData(obj);
                });
                if(api.urlParam.req_count)
                    api.urlParam.req_count++;
            },
            afterFetchData: function (obj) {
                var that = this;

                if (obj.strategy == 'scroll') {
                    that.scroll.module.setLoadingState(false);
                    that.scroll.$loading.remove();
                } else {
                    that.remind.module.setLoadingState(false);
                    that.remind.$loading.remove();
                    that.trigger('removeRefresh');
                }

                that.handleData(obj);
            },
            handleData: function (obj) {
                var that = this;

                that.trigger('preHandleData', obj); // obj上挂了: hasData 和 data(真正的数组或者对象)

                if (obj.hasData) {
                    that.handleHasData(obj);
                } else {
                    that.handleNoData(obj);
                }
            },
            handleHasData: function (obj) {
                var that = this;

                that.trigger('transformData', obj); // 外部配置：data转为字符串

                that.trigger('afterTransformData', obj); // 信息数据后添加refresh

                if (obj.strategy === 'remind') {
                    that.trigger('removeStickTop'); // 删除置顶新闻
                }

                that.trigger('insert', obj); // 信息插入dom

                if (that.conf.hasRemindLoad) {
                    that.remind.module.trigger('startRefresh'); // 更新时间提醒
                }

                that.trigger('afterInsert', obj); // 外部配置：图片懒加载、插入广告

                that.afterHandleData(obj);
            },
            handleNoData: function (obj) {
                var that = this;

                // 设置成没有数据
                if (obj.strategy == 'scroll') {
                    that.scroll.hasData = false;
                } else {
                    that.remind.hasData = false;
                }

                that.afterHandleData(obj);
            },
            afterHandleData: function (obj) {
                var that = this;

                var $result = $(that.alert.result),
                    text = obj.hasData ? '为您推荐了' + obj.data.length + '篇新闻' : '小编正在努力赶稿中...';

                if (obj.strategy == 'scroll') {

                    // 滚动加载：成功后不用提示，不成功才提示
                    if (!obj.hasData) {
                        $result.find('.j-alert-text').text(text);
                        $result.prependTo(that.$container).delay(3000).slideUp(function () {
                            $(this).remove();
                        });
                    }
                } else {
                    $result.find('.j-alert-text').text(text);
                    $result.prependTo(that.$container).delay(3000).slideUp(function () {
                        $(this).remove();
                    });
                }
            },
            handleScroll: function () {
                var that = this;

                if (that.scroll.hasData) {
                    that.beforeFetchData('scroll')
                } else if (!scroll.hasData) {
                    that.lockScroll();
                }
            },
            handleRemind: function () {
                var that = this;

                if (that.remind.hasData) {
                    that.beforeFetchData('remind')
                } else {
                    that.lockRemind();
                }
            },
            bindEvent: function () {
                var that = this;

                var conf = that.conf;

                // 绑定事件
                that.bind('load_data', function (obj) {

                    if (obj.strategy == 'scroll') {
                        that.handleScroll();
                    } else if (obj.strategy == 'remind') {
                        that.handleRemind();
                    }
                });

                // 在处理好的数据之后继续添加
                that.bind('afterTransformData', function (obj) {

                    if (that.conf.hasRemindLoad && obj.strategy == 'remind') {
                        obj.handledData += that.remind.module.alert.refresh; // 前几分钟看到这里
                    }
                });

                that.bind('insert', function (obj) {
                    if (obj.strategy == 'remind') {
                        that.$container.prepend(obj.handledData);
                    } else {
                        that.$container.append(obj.handledData);
                    }
                });

                //
                that.bind('removeRefresh', function () {
                    var $refresh = that.$container.find('.j-alert-refresh');

                    if ($refresh.length) {
                        $refresh.remove();
                        that.remind.module.reloadRefresh();
                    }
                });

                //
                that.bind('removeStickTop', function () {
                    that.$container.find("[data-stick=1]").remove(); // 删除之前的置顶
                });

                // 发出请求前的处理逻辑，如：显示alert提示框
                if (conf.beforeFetchData) {
                    that.bind('beforeFetchData', conf.beforeFetchData);
                }

                // 预处理数据，验证服务端返回的数据的正确性
                if (conf.preHandleData) {
                    that.bind('preHandleData', conf.preHandleData);
                }

                // 处理数据：拼接字符串或者用模板，返回html
                if (conf.transformData) {
                    that.bind('transformData', conf.transformData);
                }

                // 插入dom之前，执行别的逻辑，如：隐藏loading，显示请求的结果
                if (conf.afterHandleData) {
                    that.bind('beforeInsert', conf.afterHandleData);
                }

                // 插入逻辑
                if (conf.insert) {
                    that.bind('insert', conf.insert);
                }

                // 信息插入到dom中后，执行别的逻辑
                if (conf.afterInsert) {
                    that.bind('insert', conf.afterInsert);
                }
            },
            lockScroll: function () {
                this.scroll.module.offEvent(); // 解绑滚动加载功能
            },
            activeScroll: function () {
                this.scroll.module.bindEvent(); //
            },
            lockRemind: function () {
                this.remind.module.stopRemind(); //
            },
            activeRemind: function () {
                this.remind.module.startRemind();
            }
        };

        return InfoFlow;
    };

    window.INFO_FLOW = {
        init: function (conf) {
            var _conf = $.extend({}, conf); // 合并参数
            var InfoFlow = createInfoFlow(_conf); // 创建信息流类
            return new InfoFlow(_conf); // 初始化类，并且返回
        }
    };

})();