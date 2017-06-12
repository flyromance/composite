/**
 * Created by j-fanlong on 2017/2/16.
 * 依赖jquery
 */

(function ($) {
    /**
     * @method vendorPropName
     * @param string css属性名称 transition transform等
     * @return string or null 转化后的css属性名称，比如：在老chrome浏览器中 transition 被转为 WebkitTransition; 在ie8中 返回null！
     *
     * */
    var vendorPropName = (function () {
        var style = document.createElement('div').style,
            cssPrefixes = ['Webkit', 'Moz', 'O', 'ms', 'Khtml'], // css3属性
            memory = {}; // 用于记忆 Css3 属性

        return function (prop) {
            // 处理一般的属性, 不做记忆
            if (prop in style) {
                return prop;
            }

            // 处理css3属性
            if (typeof memory[prop] === "undefined") {
                var lens = cssPrefixes.length,
                    capName = prop.charAt(0).toUpperCase() + prop.slice(1),
                    vendorName;
                memory[prop] = null; // 初始化，下次就不会走这个if了

                while (lens--) {
                    vendorName = cssPrefixes[lens] + capName; // eg: WebkitTransition; WebkitBorderRadius
                    if (vendorName in style) {
                        return memory[prop] = vendorName;
                    }
                }
            }

            return memory[prop];
        }
    })();

    /**
     * @method supportCss3 是否支持Css3属性，
     * @param string css属性名称
     * @requires vendorPropName
     * @function 判断动画效果用css3属性来实现，还是用setInterval(jquery animate)来实现
     * @return boolean
     * */
    function supportCss3(name) {
        if (typeof name !== 'string') {
            return false;
        }
        return !!vendorPropName(name);
    }

    /**
     * 获取transitionend 事件名称
     * */
    function getTransitionEndName() {
        var transEndEventNames = {
            WebkitTransition: 'webkitTransitionEnd',
            MozTransition: 'transitionend',
            OTransition: 'oTransitionEnd otransitionend',
            transition: 'transitionend'
        };

        var name = vendorPropName('transition');

        return name ? transEndEventNames[name] : null;
    }

    /**
     * 是否为ie
     */
    function isIE() {
        var result = navigator.userAgent.match(/(msie|chrome|safari|firefox|opera|trident)/i);
        result = result ? result[0] : '';

        if (result.toLowerCase() == 'msie' || result.toLowerCase() == 'trident') {
            return true;
        }
        return false;
    }

    /**
     * todo direction: 'horizontal', effect为slide时，这个direction才有效，默认是水平放向
     * */
    var default_options = {
        width: '', // 用于设置wrapper/container的高度
        height: '', // 用于设置wrapper/container的高度
        container: '', // .j-promo-main, 直接包裹wrapper的容器，css被设置为display：relative || absolute，overflow：hidden
        wrapper: '', // .j-promo-wrapper, 在effect为slide时，这个wrapper的宽度、transition，被操作的对象；
        effect: 'slide', // 默认是slide，还可以设置为 'fade': 淡入淡出 'normal': 没有效果
        operator: ['', ''], // 左右触发条; 支持: string, dom, jquery elem; 第一个代表左，第二个代表右，
        operatorDisabledClassName: '', // 只有loop为false才有效, 点到最后一个或第一个, 就不让点了；注意：这个class名必须写在自身！
        nav: null, // string, dom, jquery elem, 导航触发条
        navTriggerType: 'click', // 'hover', nav触发切换的交互方式
        dataRelateAttr: '', // 导航触发条，通过这个属性获取每个导航元素对应的大图，$().data(dataRelateAttr); 如果不传，以数字索引！！
        navSelectedClassName: 'selected', // nav导航选中的class名
        loop: true, // 循环播放：如果是false,
        interval: 2999, // 间隔 秒S，只要有interval，autoPlay
        duration: 499, // 动画持续时间, 不能大于interval间隔时间
        beforeChange: null, // function 动画开始前执行
        afterChange: null
    };

    // 封装的carousel类，为了隐藏对外的方法
    function Carousel(elem, option) {
        var that = this;

        that.instance = new CarouselPlugin(elem, option);
    }

    Carousel.prototype = {
        constructor: Carousel,
        slideTo: function (num) { // 对外暴露的方法
            var that = this;

            that.instance.slideTo(num);
        },
    };

    // 正真的carousel类
    function CarouselPlugin(elem, conf) {
        this.init(elem, conf);
    }

    CarouselPlugin.prototype = {
        constructor: CarouselPlugin,
        init: function (elem, conf) {
            var that = this;

            that.curIndex = 0;
            that.willIndex = 1;
            that.slideIndex = 1;

            that.handleConf(conf); // 处理参数
            that.handleUI(elem); // 处理ui
            that.bindEvent(); // 绑定事件

            if (that.conf.loop) {
                that.start();
            }
        },
        handleConf: function (conf) {
            var that = this;

            that.conf = conf;

            // 处理duration 和 interval; 支持输入'200ms'
            that.conf.duration = parseFloat(that.conf.duration);
            that.conf.interval = parseFloat(that.conf.interval);
            if (that.conf.duration >= that.conf.interval) {
                that.conf.interval = that.conf.interval + 200
            }

            // 配置duration
            that.conf.transitionDuration = that.conf.duration + 'ms';

            // 判断浏览器是否支持css3属性
            that.conf.isSupportCss3 = false;
            if (supportCss3('transform') && supportCss3('transition') && !isIE() && (that.conf.transitionEndName = getTransitionEndName())) {
                that.conf.isSupportCss3 = true;
            }
        },
        handleUI: function (topElem) {
            var that = this;

            var $container, $wrapper, $firstChild, $lastChild, cssParam, position;

            that.ui = $.extend(that.ui || {}, {
                $top: $(topElem)  // 顶级元素 $(top).carousel({conf})
            });
            $.extend(that.ui, {
                $container: that.ui.$top.find(that.conf.container),
                $wrapper: that.ui.$top.find(that.conf.wrapper),
                $nav: that.ui.$top.find(that.conf.nav),
            });

            // 传入的配置为准，没有就使用$top的高度
            that.conf.width = that.conf.width ? parseFloat(that.conf.width) : that.ui.$top.width();
            that.conf.height = that.conf.height ? parseFloat(that.conf.height) : that.ui.$top.height();

            // 设置高度、宽度
            that.ui.$container.width(that.conf.width);
            that.ui.$container.height(that.conf.height);

            // nav: 设置导航索引方式
            if (!that.conf.dataRelateAttr) { // 没有配置，也就是说明html上没有设置data-index 。。。，用户默认为数字索引
                that.ui.$nav.each(function (index) {
                    $(this).data('index', index);
                });
                that.conf.dataRelateAttr = 'index';
            }

            // opt
            if ($.isArray(that.conf.operator)) {
                that.ui.$prev = $(that.conf.operator[0]);
                that.ui.$next = $(that.conf.operator[1]);
            }

            // wrapper内子元素，要提前获取，之后可能要添加子元素
            that.ui.$children = that.ui.$wrapper.children();
            that.ui.lens = that.ui.$children.length;

            // container
            position = that.ui.$container.css('position');
            that.ui.$container.css({
                position: position === 'static' ? 'relative' : position,
                overflow: 'hidden'
            });

            that.ui.$container.hide();

            if (that.conf.effect == 'slide') { // 为无缝切换：前后添加元素，并且包裹外层
                cssParam = {
                    width: that.conf.width * (that.ui.lens + 2),
                    position: 'absolute',
                    overflow: 'hidden',
                    backfaceVisibility: 'hidden'
                };

                if (that.conf.isSupportCss3) {
                    cssParam.transitionProperty = 'transform';
                    cssParam.transform = 'translate3d(' + -that.conf.width + 'px, 0px, 0px)';
                } else {
                    cssParam.left = -that.conf.width;
                }

                that.ui.$wrapper.css(cssParam);

                that.ui.$children.css({
                    float: 'left',
                    width: that.conf.width,
                    overflow: 'hidden',
                    display: 'block',
                    visibility: 'visible'
                });

                $firstChild = that.ui.$children.eq(0).clone();
                $lastChild = that.ui.$children.eq(-1).clone();

                that.ui.$wrapper.append($firstChild).prepend($lastChild);
            } else if (that.conf.effect == 'fade') {

                //
                that.ui.$wrapper.css({
                    width: that.conf.width,
                    height: that.conf.height
                });

                if (that.conf.isSupportCss3) {
                    that.ui.$children.eq(0).css({
                        opacity: 1
                    }).end().slice(1).css({
                        opacity: 0
                    });
                    that.ui.$children.css({
                        position: 'absolute',
                        transitionProperty: 'opacity',
                        transitionDuration: that.conf.transitionDuration
                    });
                } else {
                    that.ui.$children.css({
                        position: 'absolute',
                    }).eq(0).css({
                        opacity: 1
                    }).end().slice(1).css({
                        opacity: 0
                    });

                }
            } else { // normal 没有效果

            }
            that.ui.$container.show();
        },
        setStyle: function (num) {
            var that = this;

            if (that.conf.isSupportCss3) {
                that.ui.$wrapper.css({
                    // transitionProperty: 'none'
                    transitionDuration: '0ms'
                }).css({
                    transform: 'translate3d(' + -that.conf.width * num + 'px, 0px, 0px)'
                }).css({
                    // 注意：因为上面的过度还没完成，接着设置过渡会造成有过渡效果；应该把这个逻辑放在beforeChange内
                    // transitionProperty: 'transform'
                });
            } else {
                that.ui.$wrapper.css({left: -that.conf.width * num});
            }
        },
        beforeChange: function () {
            var that = this;

            if (that.conf.effect == 'slide') {
                // 在开始切换之前，设置过渡效果属性，最好在判断一下；
                if (that.conf.isSupportCss3) {

                    that.ui.$wrapper.css({
                        // transitionProperty: 'transform'
                        transitionDuration: that.conf.transitionDuration
                    })
                }
            } else if (that.conf.effect == 'fade') {
                that.ui.$children.eq(that.willIndex).css({opacity: 0});
            }

            // 切换之前
            if (typeof that.conf.beforeChange === 'function') {
                that.conf.beforeChange();
            }
        },
        afterChange: function () {
            var that = this;

            // 检查是否要重新定位wrapper
            if (that.conf.effect == 'slide') {

                if (that.slideIndex == 0) {
                    that.setStyle(that.ui.lens);
                } else if (that.slideIndex == that.ui.lens + 1) {
                    that.setStyle(1);
                }
            } else if (that.conf.effect == 'fade') {

            }

            // 切换之后
            if (typeof that.conf.afterChange === 'function') {
                that.conf.afterChange.call(null, that.ui.$top, that.curIndex);
            }
        },
        setAnimate: function (num, cb) {
            var that = this;

            if (that.conf.effect == 'slide') {
                if (that.conf.isSupportCss3) {
                    that.ui.$wrapper.one(that.conf.transitionEndName, function () {
                        cb();
                    });
                    that.ui.$wrapper.css({
                        transform: 'translate3d(' + -that.conf.width * num + 'px, 0px, 0px)',
                    });
                } else {
                    that.ui.$wrapper.animate({
                        left: -that.conf.width * num
                    }, that.conf.duration, 'swing', function () {
                        cb();
                    })
                }
            } else if (that.conf.effect == 'fade') {
                that.ui.$wrapper.one(that.conf.transitionEndName, function () {
                    cb();
                });
                if (that.conf.isSupportCss3) {
                    that.ui.$children.eq(num).css({opacity: 1});
                    that.ui.$children.eq(that.curIndex).css({opacity: 0});
                } else {
                    that.ui.$children.eq(num).animate({
                        opacity: 1
                    }, that.conf.duration, 'swing', function () {
                        cb();
                    });
                    that.ui.$children.eq(that.curIndex).animate({
                        opacity: 0
                    }, that.conf.duration, 'swing', function () {
                        cb();
                    })
                }
            }
        },
        setNavSelected: function (index) {
            var that = this;

            that.ui.$nav.removeClass(that.conf.navSelectedClassName).eq(index).addClass(that.conf.navSelectedClassName);
        },
        slideTo: function (num) {
            var that = this;
            var willIndex = num,
                curIndex = that.curIndex,
                slideIndex = num;
            that.willIndex = num;

            if (that.isAnimated === true) {
                return;
            }

            if (curIndex == willIndex) {
                return;
            }

            that.beforeChange(); // 切换之前执行

            // 配置参数
            if (that.conf.effect == 'slide') {
                if (num == that.ui.lens - 1) { // 目标是去最后一个
                    if (curIndex == 0 && num !== 1) { // 目前是处于第一个
                        slideIndex = 0;
                    } else { // 目前不处于第一个
                        slideIndex = num + 1;
                    }
                } else if (num == 0) { // 第一个
                    if (curIndex == that.ui.lens - 1) {
                        slideIndex = that.ui.lens + 1;
                    } else {
                        slideIndex = num + 1;
                    }
                } else { // 去掉头尾
                    slideIndex = num + 1;
                }
            } else if (that.conf.effect == 'fade') {

            }

            // 开启切换
            that.isAnimated = true;
            that.setAnimate(that.slideIndex = slideIndex, function () {
                that.curIndex = willIndex;
                that.isAnimated = false;
                that.afterChange(); // 切换之后执行
            });

            // 切换nav样式
            that.setNavSelected(willIndex);
        },
        slideNext: function () {
            var that = this;

            var _index = that.curIndex + 1;
            that.slideTo(_index >= that.ui.lens ? 0 : _index);
        },
        slidePrev: function () {
            var that = this;

            var _index = that.curIndex - 1;
            that.slideTo(_index < 0 ? that.ui.lens - 1 : _index);
        },
        start: function () {
            var that = this;

            that.stop(); // 先暂停
            that.autoTimer = setInterval(function () {
                that.slideNext();
            }, that.conf.interval);
        },
        stop: function () {
            var that = this;

            clearTimeout(that.autoTimer);
            that.autoTimer = null;
        },
        lockOperator: function (type) {
            var that = this;

            if (type == 'prev') {
                that.ui.$prev.addClass(that.conf.operatorDisabledClassName);
                that.isPrevLocked = true;
            } else {
                that.ui.$next.addClass(that.conf.operatorDisabledClassName);
                that.isNextLocked = true;
            }
        },
        activateOperator: function (type) {
            var that = this;

            if (type == 'prev') {
                that.ui.$prev.removeClass(that.conf.operatorDisabledClassName);
                that.isPrevLocked = false;
            } else {
                that.ui.$next.removeClass(that.conf.operatorDisabledClassName);
                that.isNextLocked = false;
            }
        },
        bindEvent: function () {
            var that = this;

            // 鼠标移动到焦点图，停止播放
            if (that.conf.loop) {
                that.ui.$top.hover(function () {
                    that.stop();
                }, function () {
                    that.start();
                });
            }

            // 下一个按钮
            that.ui.$next.on('click', function (e) {
                if (that.conf.loop === false) {
                    that.activateOperator('prev'); // 点击下一个，激活上一个

                    if (that.isNextLocked === true) {
                        return;
                    }

                    if ((that.curIndex + 1) == that.ui.lens) {
                        that.lockOperator('next');
                    } else {
                        that.slideNext();
                    }
                } else {
                    that.slideNext();
                }
            });

            // 上一个按钮
            that.ui.$prev.on('click', function (e) {
                if (that.conf.loop === false) {
                    that.activateOperator('next'); // 点击上一个，激活下一个

                    if (that.isPrevLocked === true) {
                        return;
                    }

                    if ((that.curIndex - 1) == -1) {
                        that.lockOperator('prev');
                    } else {
                        that.slidePrev();
                    }
                } else {
                    that.slidePrev();
                }
            });

            // 导航触发条
            if (that.conf.navTriggerType == 'hover') {

                // 注意：如果nav的父级元素z-index层级不够高（父级元素的同级元素的z-index高），导致被覆盖，无法识别鼠标点击或者移入
                that.ui.$nav.hover(function (e) {
                    that.slideTo(parseInt($(this).data(that.conf.dataRelateAttr)));
                });
            } else {
                that.ui.$nav.click(function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    that.slideTo(parseInt($(this).data('index')));
                })
            }
        },
    };

    // 暴露出去
    window.BTIME_CAROUSEL = window.BTIME_CAROUSEL ? (window._BTIME_CAROUSEL = window.BTIME_CAROUSEL) : void 0;
    window.BTIME_CAROUSEL = Carousel;

    // 封装jquery插件
    $.fn.carousel = function (conf) {

        return this.each(function (index, elem) {
            var $elem = $(elem),
                carousel = $elem.data('carousel'),
                _conf;

            if (!(carousel instanceof Carousel)) {
                _conf = $.extend({}, default_options, $elem.data(), conf);
                $elem.data('carousel', new Carousel(elem, _conf));
            }

            // prev, next, 0(number)
            if (typeof conf === 'string') {
                // carousel[conf]();
            } else if (typeof conf === 'number') {
                // carousel.changeTo(conf);
            }
        });
    };

})(jQuery);