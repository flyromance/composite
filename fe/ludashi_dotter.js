(function () {
  function BaodianDotter() {
    var params = {
      "uid": mid,
      "sign": "ex_40895b4c",
      "version": 9,
      "device": 2,
      "net": 5,
      "sqid": "",
      "act": "click",
      "stype": "portal",
      "tj_cmode": "pclook"
    }

    this.params = params;
  }

  BaodianDotter.prototype = {
    dot: function (et) {
      this.et = et;

      if (!et.href) {
        return;
      }

      if (this._isDotValid && !this._isDotValid()) {
        return;
      }

      this.params["t"] = new Date().getTime();
      this.params["url"] = et.href;

      if (this._getExt) {
        this._getExt();
      }

      try {
        new Image().src = this.dotUrl + '?' + $.param(this.params);
      }
      catch (e) {
        // log here
      }
    }
  };


  function FirstScreenDotter() {
    BaodianDotter.call(this);
    this.dotUrl = "http://api.look.360.cn/srv/c";
    // this.dotUrl = "http://res.qhupdate.com/360reader/click.gif";
    this.params["scene"] = "";
    this.params["sub_scene"] = "";
    this.params["refer_scene"] = 0;
    this.params["refer_subscene"] = 0;
    // this.params["func"] = "mini_one";
  };

  (function () {
    var Super = function () { };
    Super.prototype = BaodianDotter.prototype;
    FirstScreenDotter.prototype = new Super();
  })();

  FirstScreenDotter.prototype._getExt = function () {
    this.params["channel"] = $("#nav .cur").attr("bk_baodian").split("_")[1];
  }

  FirstScreenDotter.prototype._isDotValid = function () {
    if ($("#nav .cur").attr("bk_baodian") === undefined) {
      return false;
    }

    var et = this.et;

    if ($(et).attr("ctype") == 1) {
      return false;
    }

    return true;
  }

  function SecondScreenDotter() {
    BaodianDotter.call(this);
    this.dotUrl = "http://api.look.360.cn/srv/c";
    this.params["scene"] = "";
    this.params["sub_scene"] = "";
    // this.params["func"] = "mini_two";
  };

  (function () {
    var Super = function () { };
    Super.prototype = BaodianDotter.prototype;
    SecondScreenDotter.prototype = new Super();
  })();

  SecondScreenDotter.prototype._getExt = function () {
    var et = this.et;

    this.params["a"] = $(et).data('a');
    this.params["c"] = $(et).data('c');
    this.params["source"] = $(et).data('source');
    this.params["s"] = $(et).data('s');
    this.params["channel"] = $(et).data('channel');

    this.params["style"] = 1;
  }

  SecondScreenDotter.prototype._isDotValid = function () {
    var self = this;

    var _isValid = function (attr) {
      if (($(self.et).data(attr) != undefined) && ($(self.et).data(attr) != "undefined")) {
        return true;
      }

      return false;
    }

    var datas = ["a", "c", "s", "source"];

    if ($.grep(datas, _isValid).length == 0) {
      return false;
    }

    return true;
  }

  window.FirstScreenDotter = FirstScreenDotter;
  window.SecondScreenDotter = SecondScreenDotter;
})();

(function () {
  var fsd = new FirstScreenDotter(); // 第一屏
  var ssd = new SecondScreenDotter();  // 第二屏

  $(".spage-1").on("click", "a", function () {
    fsd.dot(this);
  });

  $(".spage-2").on("click", "a", function () {
    ssd.dot(this);
  });
})();