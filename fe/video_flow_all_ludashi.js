function cutImg(url, size) {
  size = size || '160_90';
  var n = 'dmfd/' + size + '_';
  return url ? url.replace(/(p\d*)\.(ssl\.)?(qhimg(s4)?)\.com\/(\w{2,}\/\d*_\d*_\d*\/)*/ig, "$1.$2$3.com/" + n + "/") : ""
}

var StringH = {
  //字符串长度,中文算两个字符
  byteLen: function(s) {
    return (s || '').replace(/[^\x00-\xff]/g, "--").length;
  },
  //截取字符串,超长部分替换为...
  subByte: function(s, len, tail) {
    if (StringH.byteLen(s) <= len) {
      return s;
    }
    tail = tail === undefined ? '...' : tail;
    len -= StringH.byteLen(tail);
    return s.substr(0, len).replace(/([^\x00-\xff])/g, "$1 ") //双字节字符替换成两个
      .substr(0, len) //截取长度
      .replace(/[^\x00-\xff]$/, "") //去掉临界双字节字符
      .replace(/([^\x00-\xff]) /g, "$1") + tail; //还原
  },
  // 缩短字符串到指定长度，中间部分替换为...
  shorting: function(str, len, omiss) {
    omiss = omiss || '...';
    if (str.length > len) {
      return str.substr(0, len / 2) + omiss + str.substr(str.length - len / 2);
    } else {
      return str;
    }
  }
};

function PageSlider($container, options) {
  this.$container = $container;
  this.init();
}

PageSlider.prototype = {
  nfFirstCookieKey: 'index-newsflow-tips-first',
  nfFirstCookieValue: window.nfFirstCookieValue || '20171019',
  scrollLock: false,
  init: function() {
    var self = this;
    this.$container.tinyscrollbar({
      trackSize: 420,
      onScroll: function(e) {
        self.onScroll(e);
      }
    });
    if (Cookie.get(self.nfFirstCookieKey) != self.nfFirstCookieValue) {
      this.$container.find('.newsflow-tips').addClass('first-style');
    }
    this.bindEvents();
  },
  bindEvents: function() {
    var self = this;
    var $newsflowTips = this.$container.find('.newsflow-tips');
    var _noselect = function() {
      return false;
    };
    self.$container.find('.thumb').on('mousedown', function() {
      $(document).on('selectstart', _noselect);
    });
    if (!window._ps_doc_mup_binded) {
      window._ps_doc_mup_binded = true;
      $(document).on('mouseup', function(e, a) {
        if (a != 'trigger') {
          $(document).off('selectstart', _noselect);
        }
      });
    }
    self.$container.find('.page_home').on('click', function() {
      var $page = $(this).parents('.page');
      $page = $page.find('.spage-2');
      var sb = self.$container.data("plugin_tinyscrollbar");
      // PageSlider.scrollTo($page, 0);
      $page.css({
        'height': '490px'
      });
      sb.update(0);
      $(this).hide();
      $newsflowTips.fadeIn();
    });
    $newsflowTips.on('mouseover', function() {
      self.onScroll({
        deltaY: 100
      });
    });
    $('.showcase').on('mousewheel', function(e) {
      self.onScroll(e);
    });
  },
  onScroll: function(e) {
    var self = this;
    mini.stopOrder();
    var $this = this.$container;
    var $newsflowTips = $this.find('.newsflow-tips');
    var delta = e.deltaY || (-1 * e.originalEvent.wheelDelta);
    var pageHeight = $this.find('.viewport').height();
    var sb = $this.data("plugin_tinyscrollbar");
    var $thumb = $this.find(".thumb");
    var top = sb.contentPosition;
    var $page = $this.find('.spage-2');
    var $home = $this.find('.page_home');
    var $newsflow_wrapper = $this.find('.news-content-wrapper');


    if (delta > 0) { // 向下
      if (sb.scrollLock) return;
      if (top < pageHeight) {
        sb.scrollLock = true;
        setTimeout(function() {
          sb.scrollLock = false;
        }, 300)
        $home.show(300);
        if ($page.find('.news-content-wrapper > li').length <= 8) {
          $page.css('height', 588);
        } else {
          $page.css('height', 'auto');
        }
        sb.update(490);
        if ($newsflow_wrapper.children('li').length == 0) {
          News.getNews('refresh', function() {
            $page.css('height', 'auto');
            sb.update(490);
          }, $newsflow_wrapper);
        }
        if ($newsflowTips.hasClass('first-style')) {
          $newsflowTips.hide().removeClass('first-style');
          Cookie.set(self.nfFirstCookieKey, self.nfFirstCookieValue, {
            expires: 1000 * 60 * 60 * 24 * 365 * 100
          });
        } else {
          $newsflowTips.fadeOut();
        }
      } else if (top > sb.contentSize - 100 - pageHeight) {
        this.getNews();
      }
      News.curScroll = sb.contentPosition + $this.offset().top + pageHeight;
      News.checkImptk();
    } else if (delta < 0) { // 向上
      if (top < pageHeight) {
        $thumb.trigger('mouseup', ['trigger']);
        $home.hide(300);
        $page.css({
          'height': '414px'
        });
        sb.update(0);
        $newsflowTips.fadeIn();
      }
    }
  },
  getNews: function() {
    var self = this;
    var sb = self.$container.data("plugin_tinyscrollbar");
    if (!self.scrollLock) {
      self.scrollLock = true;

      var $newsflow_wrapper = self.$container.find('.news-content-wrapper');
      News.getNews('loadMore', function() {
        sb.update('relative');
        self.scrollLock = false;
      }, $newsflow_wrapper);
    }
  }
};

//信息流
$(function() {
  var curTheme = {
      theme: 'youlike',
      loadType: 'refresh'
    },
    adsUrl = 'http://show.g.mediav.com/s?type=1&of=4&newf=1&showid=PDkl8Z', //默认MV广告接口
    adsSetUrl = 'http://show.g.mediav.com/s?type=1&of=4&newf=1&showid=0i5zPv', //默认MV图集接口
    newsPack = 1, //记录的新闻包数量
    charLimit = 40,
    newsCount = 10, //请求的新闻数量
    curScroll = 0, //当前滚动条位置
    imptks = [], //MV广告位置以及打点url
    checkTimer = '', //定时器
    errorTimer = '', //定时器
    firstLoad = true, //是否首次加载
    adsParam = { //广告云控默认参数
      ca: -1,
      sl: 4,
      sp: 4
        // tj: [2,4]
    },
    btimeCidMap = {
      rec: 0,
      ent: 4,
      game: 27,
      sports: 3,
      car: 9,
      finance: 26,
      military: 6,
      society: 12,
    },
    adsCfg = { //广告数据记录
      cn: 0, //上条广告位置
      s: 0, //已加载新闻总数
      n: 0 //已加载广告总数
    },
    bt = { //北京时间接口参数
      url: 'http://third.api.btime.com/News/list',
      data: {
        from: 'ludashi',
        cid: 0,
        mid: mid,
        refresh_type: 1,
        os: 'pc',
        count: 10,
        timestamp: 1479697594,
        is_paging: 0,
        offset: 10
      }
    },
    btime_feed = {
      url: 'http://third.api.btime.com/News/list',
      data: {
        from: 'ludashi',
        refresh_type: 2,
        count: 24,
        is_paging: 0,
        os: 'win',
        net_level: 1,
        uid: mid,
        cid: 0,
      }
    },
    k360kan = { //快视频接口参数
      url: 'http://k.360kan.com/video/btime/list',
      data: {
        from: 'minitc',
        uid: mid,
        wz: 'tj',
        channel_id: '',
        n: 12
      }
    },
    k360browser = { //浏览器混合接口
      url: 'http://mini.browser.360.cn/flow/getchannelinfo',
      data: {
        mid: mid,
        count: 24
      }
    },
    jrbd = { //信息流接口
      url: 'http://papi.look.360.cn/mlist',
      data: {
        u: mid,
        uid: mid,
        sign: 'ex_40895b4c',
        version: '2.0',
        device: 2,
        t: +new Date,
        market: 'pc_def',
        net: 5,
        ufrom: 1,
        scene: 14001,
        sub_scene: 0,
        refer_scene: 0,
        refer_subscene: 0,
        pid: 'index',
        src: '',
        tj_cmode: 'pclook',
        v: 1,
        sv: 4,
        n: 10,
        action: 2,
        f: 'jsonp',
      }
    },
    mv_uid = (function() {
      function getHash(str) {
        var hash = 1,
          charCode = 0,
          idx;
        if (str) {
          hash = 0;
          for (idx = str.length - 1; idx >= 0; idx--) {
            charCode = str.charCodeAt(idx);
            hash = (hash << 6 & 268435455) + charCode + (charCode << 14);
            charCode = hash & 266338304;
            hash = charCode != 0 ? hash ^ charCode >> 21 : hash;
          }
        }
        return hash;
      }
      return ("" + getHash(window.location.href) + getHash(document.domain) + (new Date() - 0) + Math.floor(Math.random() * 1000)).substr(0, 32);
    })();

  function initHotNews() {
    // checkAdsParam();
    // getNews('refresh');
    // getAdsParam();
    bindNewsEvent();
  };

  //获取广告云控参数
  function getAdsParam(fn) {
    getJsonp({
      url: 'http://se.360.cn/newtab/news_mediav.html',
      jsonpCallback: 'news_param_callback',
      timeout: 3000
    }).done(function(data) {
      var _date = new Date(),
        _today = _date.getFullYear() + '.' + _date.getMonth() + '.' + _date.getDate(),
        np = {};
      np.param = {
        sp: data.first_pos,
        sl: data.interval,
        ca: '0' // lizhenghua-iri 默认关闭自带广告 2017-12-19 19:05:15
        // ca: data.close
          // tj: data.tuji
      };

      np.date = _today;
      if (np.param.sp > 0 && np.param.sl > 0) {
        // np.param.tj.sort();
        adsParam = $.extend(adsParam, np.param);
      } else {}
    }).fail(function() {}).always(function() {
      getNews('refresh');
    });
  };

  //$.ajax请求，datatype:jsonp
  function getJsonp(obj) {
    return $.ajax({
      url: obj.url,
      type: 'get',
      dataType: 'jsonp',
      jsonp: obj.jsonp || 'callback',
      data: obj.d || {},
      jsonpCallback: obj.jsonpCallback,
      timeout: obj.timeout || 30000,
      success: function(data) {
        obj.success && obj.success(data, obj.num);
      },
      error: function(xhr) {
        obj.fail && obj.fail();
      },
      complete: function(data, status) {
        obj.complete && obj.complete();
      }
    })
  };

  //一次请求，若为头条接口判断token是否过期
  function getNews(type, cb, $wrapper) {
    if (type == 'refresh') {
      showLoading($wrapper);
    }
    getData(type, cb, $wrapper);
  };

  //获取数据，根据新闻数量拉取对应数量的广告
  function getData(type, cb, $wrapper) {
    var news,
      newsData = [];
    news = getBtimeFeed($wrapper);
    news.done(function(data) {
      // console.log(data);
      newsData = dealData(data, $wrapper);
      // console.log(newsData)
      if (newsData.length > 0) {
        if (adsParam.ca == '0') {
          getAdsData(newsData, type, cb);
        } else {
          renderNews(newsData, type, cb, $wrapper)
        }
      }
    }).fail(function() {
      newsData = [];
      showError('加载失败，请稍后再试', $wrapper);

      cb && cb();
    });
  };

  var _reqtimes = 1;
  //获取广告数据
  function getAdsData(newsData, type, cb) {
    var packNum = newsPack++,
      ads,
      adsSet,
      adsData = [],
      adsSetData = [],
      d = {
        uid: mv_uid,
        impct: 3
      },
      _d,
      s,
      i = calculateAdsNum(newsData, type); //根据新闻数量计算广告数量
    if (i == 0) {
      splitData(newsData, [], type, cb);
      scrollLock = false;
      return;
    }
    d.impct = i;
    d.reqtimes = _reqtimes++;
    ads = getJsonp({
      url: adsUrl,
      d: d,
      jsonp: 'jsonp',
      // jsonpCallback: 'ajax_test',
      timeout: 3000
    })
    ads.done(function(data) {
      adsData = dealAdsData(data, packNum);
    }).fail(function() {
      adsData = [];
    }).always(function() {
      splitData(newsData, adsData, type, cb);
      scrollLock = false
    })
  };

  //计算本次请求的广告总数量（包括图集）
  function calculateAdsNum(data, type) {
    var p = adsParam,
      cfg = adsCfg,
      n = data.length,
      i = 0;
    if (type == 'refresh') {
      while (p.sp + i * p.sl < n) {
        i++;
      }
    } else if (type == 'loadMore') {
      var s;
      if (cfg.s > p.sp) {
        s = p.sl > cfg.cn ? p.sl - cfg.cn : 0;
      } else if (cfg.s <= p.sp) {
        s = p.sp - cfg.s;
      }
      while (s + i * p.sl < n) {
        i++;
      }
    }
    return i;
  }

  //本次请求首条广告的位置
  function calculateParam(data, type) {
    var p = adsParam,
      cfg = adsCfg,
      n = data.length,
      m;
    if (type == 'refresh') {
      m = p.sp;
    } else if (type == 'loadMore') {
      if (cfg.s > p.sp) {
        m = p.sl > cfg.cn ? p.sl - cfg.cn : 0;
      } else if (cfg.s <= p.sp) {
        m = p.sp - cfg.s;
      }
    }
    return m;
  };

  //拼接新闻数据和广告
  function splitData(newsData, adsData, type, cb) {
    var x = calculateParam(newsData, type),
      l = newsData.length,
      y = adsParam.sl,
      cfg = adsCfg,
      _d = [],
      j = 0,
      k = 0;
    if (x >= l && adsData.length < 1) {
      _d = newsData;
      cfg.cn = newsData.length + cfg.cn;
    } else {
      for (var i = 0; i < l; i++) {
        if (x == i || ((i - x) % y == 0 && i > x)) {
          if (adsData[j]) {
            _d.push(adsData[j++]);
            k = i;
          }
        }
        _d.push(newsData[i])
      }
      if (firstLoad || type == 'loadMore') {
        cfg.cn = l - k;
        cfg.n += adsData.length;
      }
    }
    firstLoad && (firstLoad = false);
    renderNews(_d, type, cb);
    cfg.s += l;
    calculateAdsPosition(adsData);
    // checkImptk();
  }

  //计算广告的scroll位置，方便可视打点
  function calculateAdsPosition(data) {
    var len = data.length;
    if (len < 1) return;
    for (; len--;) {
      var ad = data[len];
      var $el = $('#' + ad.adsId);
      var elTop = $el.position().top + $('#tab_rec').offset().top;
      imptks.push({
        top: elTop,
        imptk: ad.imptk
      })
    }
  };

  //滚动后检查打点
  function checkImptk() {
    var scrollT = News.curScroll,
      len = imptks.length;
    for (; len--;) {
      if (imptks[len].top < scrollT) {
        setAdsLogImg(imptks[len].imptk);
        imptks.splice(len, 1);
      }
    }
  };
  //图片类打点
  function setAdsLogImg(url) {
    var urls = url.split(',');
    for (var i = 0; i < urls.length; i++) {
      new Image().src = urls[i];
    }
  };

  //北京时间新闻接口
  function getBTimeNews() {
    bt.data.timestamp = +new Date();
    return getJsonp({
      url: bt.url,
      d: bt.data,
      // timeout: 3000,
      success: function() {} //dealData
    });
  };

  //快视频接口
  function get360kan() {
    return getJsonp({
      url: k360kan.url,
      d: k360kan.data,
      // timeout: 3000,
      success: function() {} //dealData
    });
  };

  //浏览器混合接口
  var reqtimesMap = {};

  function get360browser($wrapper) {
    var cat = $wrapper.parents('.page').attr('id').slice(4);
    var data = k360browser.data;
    if (reqtimesMap[cat] === undefined) {
      reqtimesMap[cat] = 1;
    }
    data.reqtimes = reqtimesMap[cat]++;
    data.cname = $('#nav_' + cat).text();
    return getJsonp({
      url: k360browser.url,
      d: data,
      jsonp: 'callback',
      timeout: 5000,
      success: function() {} //dealData
    });
  };

  function getBtimeFeed($wrapper) {
    var cat = $wrapper.parents('.page').attr('id').slice(4);
    var data = btime_feed.data;
    if (reqtimesMap[cat] === undefined) {
      reqtimesMap[cat] = 1;
    }
    data.page = reqtimesMap[cat]++;
    data.timestamp = +new Date();
    data.cname = $('#nav_' + cat).text();
    data.cid = btimeCidMap[cat];
    return getJsonp({
      url: bt.url,
      d: data,
      jsonp: 'callback',
      timeout: 5000,
      success: function() {} //dealData
    });
  };

  function transformBtimeToBrowser(arr) {
    var ret = [];
    for (var i = 0; i < arr.length; i++) {
      var item = {};
      var obj = arr[i];
      item.firstItem = '';
      if (i === 0) {
        item.firstItem = 'first-item';
      }
      item.img = obj.data.covers[0];
      item.link = obj.open_url;
      item.log = '';
      if (obj.is_ad) {
        item.newsType = 'ad'; // news video ad
      } else {
        item.newsType = 'news'
        if (obj.data.duration) item.newsType = 'video'
      }
      item.slog = obj.s_log;
      item.title = obj.data.title;
      item.type = item.newsType;

      ret.push(item);
    }
    return ret;
  }

  //过滤北京时间新闻数据
  function dealBTimeData(data, packNum) {
    var data = data.data || [],
      _data = [],
      _log = [],
      len = data.length;

    for (var i = 0; i < len; i++) {
      var item = data[i],
        _item = {};

      if (item.data.news) continue;
      // if (item.type != 'news') continue;

      _item.imgUrl = item.data.covers;
      if (item.data.covers.length >= 3) {
        _item.packType = 'news-tpl3';
        _item.imgUrl.splice(3);
      } else if (item.data.covers.length >= 1) {
        _item.packType = 'news-tpl2';
        _item.imgUrl.splice(1);
      } else {
        _item.packType = 'news-tpl1';
      }
      _item.newsType = 'news';
      _item.title = item.data.title.trim();
      _item.t = StringH.subByte(item.data.title.trim(), charLimit) || '';
      _item.pcurl = item.open_url || "#";
      _item.f = item.data.source || '';
      _item.log = encodeURIComponent(JSON.stringify(item.s_log));
      if (item.data.tag && $.isArray(item.data.tag) && item.data.tag[0]) {
        switch (item.data.tag[0].name) {
          case '热点':
            _item.a = 'g';
            break;
          case '投票':
            _item.a = 'l';
            break;
          case '置顶':
            _item.a = 't';
            break;
          case '推广':
            _item.a = 'a';
            break;
          default:
            _item.a = 'h';
            break;
        }
      } else {
        _item.a = 'h';
      }

      _item.newsTime = formatDate(item.data.pdate * 1000);
      _data.push(_item);
      _log.push(_item.log);
    }
    setBTimeLog(_log, 'view');
    return _data;
  };

  //过滤广告数据
  function dealAdsData(data, packNum) {
    var impurl = data.impurl,
      param = '',
      d = data.ads || [],
      len = 0,
      _d = [],
      str = [];
    if (d.length < 1) return [];
    while (len < d.length) {
      var item = d[len],
        dot;
      var _data = {};

      // if (item.type == 1) {
      _data.packType = 'news-tpl2';
      _data.imgUrl = item.img.split('|');
      _data.imgUrl.splice(1);
      _data.tplType = 'news';
      // } else if (item.type == 2 && item.assets && item.assets.length) {
      //     _data.data = item.assets.splice(0, 3);
      //     _data.packType = 'news-tpl4';
      //     _data.tplType = 'ads2';
      // }

      _data.newsType = 'ads';
      _data.adsId = "ads-" + packNum + len;
      _data.title = item.title.trim();
      _data.t = StringH.subByte(item.title.trim(), charLimit) || '';
      _data.f = item.src;
      _data.pcurl = item.curl;
      _data.desc = item.desc;
      _data.imptk = item.imptk.toString();
      _data.clicktk = item.clktk.toString();
      _d.push(_data);
      if (len > 1) {
        dot = '.';
      } else {
        dot = '';
      }
      param += item.imparg + dot;
      len += 1;
    }
    impurl && setAdsLogImg(impurl + param);
    return _d;
  };

  //过滤新闻数据
  function dealData(data, $wrapper) {
    var _data = data && data.data || [],
      str = [];
    _data = transformBtimeToBrowser(_data);

    if (_data.length == 0) {
      showError('暂无新闻更新，请稍后再试', $wrapper);
    } else {
      $('.news-bd-error').hide();
    }
    return _data;
  };

  var _isFirstItem = true;
  var _adsIdCount = 0;
  //渲染数据
  function renderNews(data, type, cb, $wrapper) {
    var packCon = $wrapper,
      _d = [],
      _BTimeLog = [],
      adsData = [],
      str = '',
      len = 0,
      tpl = '',
      //tpl_news = doT.template($('#tpl-news-news').html()),
      //tpl_ads2 = doT.template($('#tpl-news-ads2').html()),
      tpl_video = doT.template($('#tpl-video-360browser').html());

    var cat = $wrapper.parents('.page').attr('id').slice(4);
    var countMap = {};

    while (len < data.length) {
      var item = data[len];
      item.newsType = item.type;
      if (item.type == 'ad') {
        item.newsType = 'ads';
        item.adsId = 'ads-' + (++_adsIdCount);
        item.imptk = item.imptk.toString();
        item.clicktk = item.clktk.toString();
        adsData.push(item);
      } else {
        item.img = cutImg(item.img);
      }
      item.pid = cat + '_page2_' + item.newsType;

      // 条数计数
      if (countMap[item.newsType] == undefined) {
        countMap[item.newsType] = 1;
      } else {
        countMap[item.newsType]++;
      }

      if (item.type == 'news') {
        item.log = encodeURIComponent(JSON.stringify(item.s_log));
        _BTimeLog.push(item.log);
      }
      // if (item.tplType == 'ads2') {
      //     tpl = tpl_ads2;
      // } else {
      //     tpl = tpl_news;
      // }
      tpl = tpl_video;
      item.firstItem = _isFirstItem ? 'first-item' : '';
      _isFirstItem = false;
      _d.push(tpl(item));
      len++;
    }
    _d.length > 0 && (str = _d.join(''));
    switch (type) {
      case "refresh":
        packCon.html(str);
        if (isIE6) {
          packCon.css('visibility', 'hidden');
          setTimeout(function() {
            packCon.css('visibility', 'visible');
          }, 0);
        }
        if (str != '') {
          $('.news-bd-error').hide();
          // showNewsTip('为您推荐了' + newsNum + '条新闻', 'refresh');
        } else {
          showError('暂无更新，请稍后再试', $wrapper);
        }
        break;
      case 'loadMore':
        packCon.append(str);
        if (packCon.children('li').length > 8) {
          packCon.parents('.spage-2').css('height', 'auto');
        }
        if (str == '') {
          showError('暂无更新，请稍后再试', $wrapper);
        } else {
          $('.news-bd-tip').hide();
          // showNewsTip('为您推荐了' + newsNum + '条新闻', 'loadMore');
        }
        break;
    };
    calculateAdsPosition(adsData);
    setBTimeLog(_BTimeLog, 'view');
    setPage2Log(cat, countMap);
    if (type == 'refresh') {
      checkImptk();
    }
    cb && cb();
  };

  function setPage2Log(cat, countMap) {
    // 二屏展现打点
    var _count = 0
    for (var x in countMap) {
      _count += countMap[x];
      se_monitor.customizeLog({
        event_name: 'track',
        para: {
          act: 'track',
          pid: 'p_' + cat + '_page2_' + x,
          count: countMap[x]
        }
      });
    }

    se_monitor.customizeLog({
      event_name: 'track',
      para: {
        act: 'track',
        pid: 'p_' + cat + '_page2',
        count: _count
      }
    });
  }

  //打点
  function setLog(data) {
    switch (data.newstype) {
      case 'news':
        setBTimeLog([data.log], 'click');
        break;
      case 'ads':
        setAdsLogImg(data.clicktk);
        break;
      default:
        break;
    }
  };

  //北京时间打点
  function setBTimeLog(logs, action) {
    /*
    var url = '//click.btime.com/api/weblog';
    // var log = $.extend({},JSON.parse(decodeURIComponent(logs)));
    logs.forEach(function(e, i) {
      var log = JSON.parse(decodeURIComponent(e));
      log.action = action;
      log.ts = +new Date();
      logs[i] = JSON.stringify(log);
    });

    $.ajax({
      'url': url,
      'type': 'post',
      'data': {
        'content[]': logs
      },
      'Content-Type': 'application/x-www-form-urlencoded',
      'success': function() {}
    })
    */
  };

  function showLoading($wrapper) {
    $wrapper.html('<div class="news-bd-loading"><img src="http://p6.qhimg.com/d/inn/7471580c/loading.gif"><br>&nbsp; loading...</div>');
  }

  //错误显示
  function showError(msg, $wrapper) {
    var $loading = $('.news-bd-loading');
    if ($loading.length > 0) {
      $loading.remove();
      var el = document.createElement('DIV');
      el.className = 'news-bd-error';
      $wrapper.prepend(el);
      $(el).empty().append('<img src="http://p2.qhimg.com/d/inn/1fb83ab4/load_error.png"><br>' + msg);
    }
    // if ($('.news-bd-error').length < 1) {
    //     var el = document.createElement('DIV');
    //     el.className = 'news-bd-error';
    //     $('.news-content-wrapper').prepend(el);
    //     $(el).empty().append(msg);
    //     $(el).slideDown('fast');
    // } else {
    //     $('.news-bd-error').empty().append(msg);
    //     $('.news-bd-error').slideDown('fast');
    // }
    // errorTimer && clearTimeout(errorTimer);
    // errorTimer = setTimeout(function() {
    //     clearTimeout(errorTimer);
    //     $('.news-bd-error').slideUp('fast');
    // }, 3000);
  };



  //新闻日期格式化
  function formatDate(date) {
    var _date = new Date(date),
      _year = _date.getFullYear(),
      _mouth = _date.getMonth() + 1,
      _day = _date.getDate(),
      _hour = _date.getHours(),
      _minute = _date.getMinutes(),
      _second = _date.getSeconds();
    _mouth = _mouth >= 10 ? _mouth : '0' + _mouth;
    _day = _day >= 10 ? _day : '0' + _day;
    _hour = _hour >= 10 ? _hour : '0' + _hour;
    _minute = _minute >= 10 ? _minute : '0' + _minute;
    return _mouth + '-' + _day + ' ' + _hour + ':' + _minute;
  };

  //事件绑定
  function bindNewsEvent() {
    $('.news-content-wrapper').delegate('a', 'click', function(e) {
      var isAds = $(this).hasClass('news-ads-a');
      $(this).parents('.news-pack').addClass('news-visited');
      $(this).length > 0 && setLog($(this).data());
    });
  }
  initHotNews();
  window.News = {
    curScroll: 0,
    checkImptk: checkImptk,
    getNews: getNews
  }
});

$(document).ready(function() {
  // IE8以下不支持array.splice
  var originalSplice = Array.prototype.splice;
  Array.prototype.splice = function(start, deleteCount) {
    var args = Array.prototype.slice.call(arguments);
    if (deleteCount === undefined) {
      args[1] = this.length - start;
    }
    return originalSplice.apply(this, args);
  };
  // 低版本浏览器兼容JSON方法
  "use strict";
  var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
    return typeof t
  } : function(t) {
    return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
  };
  "object" !== ("undefined" == typeof JSON ? "undefined" : _typeof(JSON)) && (JSON = {}),
  function() {
    function f(t) {
      return t < 10 ? "0" + t : t
    }

    function this_value() {
      return this.valueOf()
    }

    function quote(t) {
      return rx_escapable.lastIndex = 0, rx_escapable.test(t) ? '"' + t.replace(rx_escapable, function(t) {
        var e = meta[t];
        return "string" == typeof e ? e : "\\u" + ("0000" + t.charCodeAt(0).toString(16)).slice(-4)
      }) + '"' : '"' + t + '"'
    }

    function str(t, e) {
      var n, r, o, u, f, i = gap,
        a = e[t];
      switch (a && "object" === (void 0 === a ? "undefined" : _typeof(a)) && "function" == typeof a.toJSON && (a = a.toJSON(t)), "function" == typeof rep && (a = rep.call(e, t, a)), void 0 === a ? "undefined" : _typeof(a)) {
        case "string":
          return quote(a);
        case "number":
          return isFinite(a) ? String(a) : "null";
        case "boolean":
        case "null":
          return String(a);
        case "object":
          if (!a) return "null";
          if (gap += indent, f = [], "[object Array]" === Object.prototype.toString.apply(a)) {
            for (u = a.length, n = 0; n < u; n += 1) f[n] = str(n, a) || "null";
            return o = 0 === f.length ? "[]" : gap ? "[\n" + gap + f.join(",\n" + gap) + "\n" + i + "]" : "[" + f.join(",") + "]", gap = i, o
          }
          if (rep && "object" === (void 0 === rep ? "undefined" : _typeof(rep)))
            for (u = rep.length, n = 0; n < u; n += 1) "string" == typeof rep[n] && (r = rep[n], (o = str(r, a)) && f.push(quote(r) + (gap ? ": " : ":") + o));
          else
            for (r in a) Object.prototype.hasOwnProperty.call(a, r) && (o = str(r, a)) && f.push(quote(r) + (gap ? ": " : ":") + o);
          return o = 0 === f.length ? "{}" : gap ? "{\n" + gap + f.join(",\n" + gap) + "\n" + i + "}" : "{" + f.join(",") + "}", gap = i, o
      }
    }
    var rx_one = /^[\],:{}\s]*$/,
      rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
      rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
      rx_four = /(?:^|:|,)(?:\s*\[)+/g,
      rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    "function" != typeof Date.prototype.toJSON && (Date.prototype.toJSON = function() {
      return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z" : null
    }, Boolean.prototype.toJSON = this_value, Number.prototype.toJSON = this_value, String.prototype.toJSON = this_value);
    var gap, indent, meta, rep;
    "function" != typeof JSON.stringify && (meta = {
      "\b": "\\b",
      "\t": "\\t",
      "\n": "\\n",
      "\f": "\\f",
      "\r": "\\r",
      '"': '\\"',
      "\\": "\\\\"
    }, JSON.stringify = function(t, e, n) {
      var r;
      if (gap = "", indent = "", "number" == typeof n)
        for (r = 0; r < n; r += 1) indent += " ";
      else "string" == typeof n && (indent = n);
      if (rep = e, e && "function" != typeof e && ("object" !== (void 0 === e ? "undefined" : _typeof(e)) || "number" != typeof e.length)) throw new Error("JSON.stringify");
      return str("", {
        "": t
      })
    }), "function" != typeof JSON.parse && (JSON.parse = function(text, reviver) {
      function walk(t, e) {
        var n, r, o = t[e];
        if (o && "object" === (void 0 === o ? "undefined" : _typeof(o)))
          for (n in o) Object.prototype.hasOwnProperty.call(o, n) && (r = walk(o, n), void 0 !== r ? o[n] = r : delete o[n]);
        return reviver.call(t, e, o)
      }
      var j;
      if (text = String(text), rx_dangerous.lastIndex = 0, rx_dangerous.test(text) && (text = text.replace(rx_dangerous, function(t) {
          return "\\u" + ("0000" + t.charCodeAt(0).toString(16)).slice(-4)
        })), rx_one.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) return j = eval("(" + text + ")"), "function" == typeof reviver ? walk({
        "": j
      }, "") : j;
      throw new SyntaxError("JSON.parse")
    })
  }();
});