var JTemp = function() {
    function Temp(htmlId, p) {
        p = p || {}; //配置信息，大部分情况可以缺省
        this.htmlId = htmlId;
        this.fun = null;
        this.oName = p.oName || 'p';
        this.TEMP_S = p.tempS || '<%=';
        this.TEMP_E = p.tempE || '=%>';
        this.getFun();
    }
    Temp.prototype = {
        getFun: function() {
            var _ = this,
                str = $('#' + _.htmlId).html();
            if (!str) _.err('error: no temp!!');
            var str_ = 'var ' + _.oName + '=this,f=\'\';',
                s = str.indexOf(_.TEMP_S),
                e = -1,
                p,
                sl = _.TEMP_S.length,
                el = _.TEMP_E.length;
            for (; s >= 0;) {
                e = str.indexOf(_.TEMP_E);
                if (e < s) alert(':( ERROR!!');
                str_ += 'f+=\'' + str.substring(0, s) + '\';';
                p = _.trim(str.substring(s + sl, e));
                if (p.indexOf('=') !== 0) { //js语句
                    str_ += p;
                } else { //普通语句
                    str_ += 'f+=' + p.substring(1) + ';';
                }
                str = str.substring(e + el);
                s = str.indexOf(_.TEMP_S);
            }
            str_ += 'f+=\'' + str + '\';';
            str_ = str_.replace(/\n/g, ''); //处理换行
            var fs = str_ + 'return f;';
            this.fun = Function(fs);
        },
        build: function(p) {
            return this.fun.call(p);
        },
        err: function(s) {
            alert(s);
        },
        trim: function(s) {
            return s.trim ? s.trim() : s.replace(/(^\s*)|(\s*$)/g, "");
        }
    };
    return Temp;
}();
