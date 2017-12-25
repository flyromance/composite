function createTextNode(val) {
    return new Vnode(undefined, undefined, undefined, val)
}

function normalizeChildren(children) {
    if (typeof children === 'string') {
        return [ createTextNode(children) ]
    }
    return children
}

function createNode(tag, props, children) {
    return new Vnode(tag, props, normalizeChildren(children))
}

function Vnode(tag, props, children, text, elem) {
    this.tag = tag
    this.props = props
    this.children = children
    this.text = text
    this.elm = elm
}

function initData(vm) {
    var data = vm.$data = vm.$options.data
    var keys = Object.keys(data)
    var i = keys.length
    while(i--) {
        proxy(vm, keys[i])
    }

    observe(data)
}

function proxy(vm, key) {
    Object.defineProperty(vm, key, {
        configurable: true,
        enumerable: true,
        get: function () {
            return vm.$data[key]
        },
        set: function(val) {
            vm.$data[key] = val
        }
    })
}

var uid$1 = 0;

function Dep() {
    this.id = uid$1++
    this.subs = []
}

Dep.target = null

Dep.prototype.addSub = function (sub) {
    this.subs.push(sub)
}

Dep.prototype.notify = function () {
    this.subs.forEach(function (sub) {
        sub.update()
    })
}

function Watcher(vm, handler, cb) {
    this.vm = vm
    this.handler = handler
    this.cb = cb
    this.depIds = []
    this.get()
}

Watcher.prototype.get = function () {
    Dep.target = this
    this.handler.call(this)
    Dep.target = null
}

Watcher.prototype.addDep = function (dep) {
    var id = dep.id
    if (this.depIds.indexOf(id) === -1) {
        this.depIds.push(id)
        dep.addSub(this)
    }
}


function defineReactive(obj, key, val) {
    var dep = new Dep();

    Object.defineProperty(obj, key, {
        get: function () {
            if (Dep.target) {
                Dep.target.addDep(dep)
            }
            return val
        },
        set: function (newVal) {
            if (val === newVal) return
            val = newVal
            dep.notify()
        }
    })
}

function observe(data) {
    for (var key in data) {
        defineReactive(data, key, data[key])
    }
}

function Vue(options) {
    var vm = this
    vm.$options = options
    initData(vm)
    vm.mount(document.querySelector(options.el))
}

Vue.prototype.mount = function (el) {
    var vm = this
    vm.$el = el
    new Watcher(vm, function () {
        vm.updata(vm.render())
    })
}

Vue.prototype.update = function (vnode) {
    var vm = this
    var preVnode = vm._vnode
    vm._vnode = vnode
    if (!preVnode) {
        vm.$el = vm.patch(vm.$el, vnode)
    } else {
        vm.$el = vm.patch(preVnode, vnode)
    }
}

Vue.prototype.render = function () {
    var vm = this
    return vm.$options.render.call(vm)
}

Vue.prototype.patch = patch

function sameVnode(vnode1, vnode2) {
    // 必须考虑 文本节点的情况, 不能是 === 强等号, undefined == undefined
    return vnode1.tag == vnode2.tag
}

function emptyVnode(elm) {
    return new Vnode(elm.tagName.toLowerCase(), {}, [], undefined, elm)
}

function createElement(vnode) {
    var tag = vnode.tag
    var props = vnode.props
    var children = vnode.children

    if (tag !== undefined) {
        vnode.elm = document.createElement(tag)

        for (var key in props) {
            vnode.elm.setAttribute(key, props[key])
        }

        if (children) {
            children.forEach(function (child) {
                vnode.elm.appendChild(createElement(child))
            })
        }
    } else {
        vnode.elm = document.createTextNode(vnode.text)
    }

    return vnode.elm
}

function patchVnode(oldVnode, vnode) {
    var elm = vnode.elm = oldVnode.elm // 复用旧的dom节点
    var oldCh = oldVnode.children
    var ch = vnode.children

    // 自身是文本节点
    if ('text' in vnode) {
        if (oldVnode.text !== vnode.text) {
            elm.textContent = vnode.text
        }
    } else {
        // 属性节点

        // 子节点
        if (oldCh && ch) {
            // 为了减少复杂度，现在只考虑只有一个子元素的情况
            patch(oldCh[0], ch[0])
        }
    }
}

function patch(oldVnode, vnode) {
    var isDom = oldVnode.nodeType !== undefined

    // 不是初次，并且tagName相同的情况, 有可能是文本节点
    if (!isDom && sameVnode(oldVnode, vnode)) {
        patchVnode(oldVnode, vnode)
    } else {

        // 初次比较, new Vue() 有el的情况; 或者是tagName不相同的情况; 
        // 根据新的vnode生成dom，替换旧的dom节点
        if (isDom) {
            oldVnode = emptyVnode(oldVnode)
        }
        var elm = oldVnode.elm
        var parent = elm.parentNode

        createElement(vnode) // 生成新的dom
        parent.insertBefore(vnode.elm, elm)
        parent.removeChild(elm)
    }
}

var vue = new Vue({
    el: '#app',
    data: {
        message: 'hello world',
        isShow: true,
    },
    render: function () {
        return createNode(
            'div',
            {
                'class': 'wrapper',
                'id': 'wrapper'
            },
            [
                this.isShow ? 
                    createNode(
                        'p',
                        {
                            'class': 'inner-p'
                        },
                        this.message
                    ) :
                    createNode(
                        'h1',
                        {
                            class: 'inner-h1'
                        },
                        'this is h1'
                    )
            ]
        )
    }
})

