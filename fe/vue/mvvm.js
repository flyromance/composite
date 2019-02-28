
class Comp {
    constructor(opt) {
        this.opt = opt;
        this.watcher = {};
        this.template = opt.template;
        this.data = opt.data;
        this.handleData(opt.data);
        this.parseTemp(opt.template);
        this.render(opt.el)
    }

    render(id) {
        var self = this;
        var el = this.el = document.getElementById(id);
        this.keys.forEach(function (key) {
            self.data[key] = self.data[key];
        })
    }

    handleData(data) {
        var self = this;
        var keys = Object.keys(data);
        this.keys = keys;
        keys.forEach(function (key) {
            var value = data[key];
            var isFirst = false;
            Object.defineProperty(data, key, {
                get: function () {
                    return value
                },
                set: function (n) {
                    if (!isFirst || n !== value) {
                        isFirst = true;
                        self.notify(key, n);
                    }
                },
                enumerable: true,
                configurable: true,
            });

        })
    }

    parseTemp(tpl) {
        var self = this;
        var r_bind = /\s+v-bind:\w+=['"](\w+)['"]/g,
            r_text = /(?!\{\{})([\w]+)(?=\}\})/g;

        var bind_match = tpl.match(r_bind) || [];
        var text_match = tpl.match(r_text) || [];

        bind_match.forEach(function (item) {
            if (self.keys.indexOf(item) > -1) {
                self.setWather(item, function (tpl, value) {
                    return tpl.replace(/\s+v-bind:(\w+)=['"](\w+)['"]/g, function (all, $1) {
                        return ' ' + $1 + '="' + value + '"'
                    })
                })
            }
        });

        text_match.forEach(function (item) {
            if (self.keys.indexOf(item) > -1) {
                self.setWather(item, function (tpl, value) {
                    return tpl.replace(/\{\{([\w]+)\}\}/g, function (all, $1) {
                        return value
                    })
                })
            }
        });
    }

    notify(key, value) {
        var self = this;
        var watchers = this.getWatcher(key);
        var tpl = self.template;
        watchers.forEach(function (item) {
            tpl = item.call(null, tpl, value)
        })
        this.el.innerHTML = tpl;
    }

    getWatcher(key) {
        return this.watcher[key] ? this.watcher[key] : this.watcher[key] = [];
    }

    setWather(key, handler) {
        var wathers = this.getWatcher(key);
        wathers.push(handler)
    }
}

var data = {
    title: 'this is title',
    text: 'this is text'
}
var comp = new Comp({
    el: 'app',
    template: `<div v-bind:title="title">{{text}}</div>`,
    data: data,
})