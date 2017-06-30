// 扁平对象，转为tree
var data = [{
    "province": "浙江",
    "city": "杭州",
    "town": "西湖"
}, {
    "province": "四川",
    "city": "成都",
    "town": "锦里"
}, {
    "province": "四川",
    "city": "成都",
    "town": "方所"
}, {
    "province": "四川",
    "city": "阿坝",
    "town": "九寨沟"
}];

function transToObj(input, keys) {
    var lens = input.length,
        arr = [],
        cache = {},
        i, j, item, arr_item;

    for (i = 0; i < lens; i++) {
        item = input[i];
        if (cache[item[keys[0]]] !== undefined) {
            arr_item = arr[cache[item[keys[0]]]];
        } else {
            cache[item[keys[0]]] = arr.length;
            arr[arr.length] = {
                value: item[keys[0]],
                children: [{
                    value: item[keys[1]],
                    children: [{
                        value: item[keys[2]]
                    }]
                }]
            };
        }
    }

    return arr;
}

var _outData = transToObj(data, ['province', 'city', 'town']);

var outData = [{
    value: '省',
    children: [{
        value: '市',
        children: [{
            name: '县'
        }]
    }],
}];


// 扁平对象，转为tree
var input = {
    h3: {
        parent: 'h2',
        name: '副总经理(市场)'
    },
    h1: {
        parent: 'h0',
        name: '公司机构'
    },
    h7: {
        parent: 'h6',
        name: '副总经理(总务)'
    },
    h4: {
        parent: 'h3',
        name: '销售经理'
    },
    h2: {
        parent: 'h1',
        name: '总经理'
    },
    h8: {
        parent: 'h0',
        name: '财务总监'
    },
    h6: {
        parent: 'h4',
        name: '仓管总监'
    },
    h5: {
        parent: 'h4',
        name: '销售代表'
    },
    h0: {
        parent: '',
        name: 'root'
    }
};

function translateToTree(input) {
    var parent_key, ret;
    for (var key in input) {
        parent_key = input[key].parent;
        if (parent_key) {
            input[parent_key][key] = input[key];
        } else {
            ret = input[key];
        }
    }
    return ret;
}

translateToTree(input);

var output = {
    parent: '',
    name: 'root',
    h1: {
        parent: 'h0',
        name: 'xxx',
        h2: {
            parent: 'h1',
            name: 'xxx'
        }
    }
};


// 处理树形结构的几个场景与方案

// 遍历dom树

// function walkDom(elem, handler) {
//     if (!elem) return;
//     handler.call(elem, elem);
//     var children = elem.children;console.log(children);
//     for (var i = 0; i < children.length; i++) {
//         walkDom(children[i], handler);
//     }
// }

// walkDom(document, function() {console.log( this.nodeName)});

function walkDom(node, callback) {
    if (node === null) { //判断node是否为null
        return;
    }
    callback(node); //将node自身传入callback
    node = node.firstElementChild; //改变node为其子元素节点
    while (node) {
        walkDom(node, callback); //如果存在子元素，则递归调用walkDom
        node = node.nextElementSibling; //从头到尾遍历元素节点
    }
}
walkDom(document, function(node) { console.log(node.nodeName); }); //包含document节点
console.log(document.querySelectorAll('*').length); //数量比上面输出的少1，因为不包含document节点

// 递归: 实现querySelector('.class')
function queryByClass(node, name) {
    if (node.type != 1 || node.type != 9) return null;
    var ret = [];
    var children = node.children,
        lens = children.length,
        elem;
    for (var i = 0; i < lens; i++) {
        elem = children[i];
        if (elem.className.indexOf(name.trim()) != -1) {
            ret.push(elem);
        }
        ret = ret.concat(queryByClass(elem));
    }

    return ret;
}


// 二叉树查找
class Node {  
  constructor(data, left, right) {
    this.data = data;
    this.left = left;
    this.right = right;
  }
}

class BinarySearchTree {

    constructor() {
        this.root = null;
    }

    insert(data) {
        let n = new Node(data, null, null);
        if (!this.root) {
            return this.root = n;
        }
        let currentNode = this.root;
        let parent = null;
        while (1) {
            parent = currentNode;
            if (data < currentNode.data) {
                currentNode = currentNode.left;
                if (currentNode === null) {
                    parent.left = n;
                    break;
                }
            } else {
                currentNode = currentNode.right;
                if (currentNode === null) {
                    parent.right = n;
                    break;
                }
            }
        }
    }

    remove(data) {
        this.root = this.removeNode(this.root, data)
    }

    removeNode(node, data) {
        if (node == null) {
            return null;
        }

        if (data == node.data) {
            // no children node
            if (node.left == null && node.right == null) {
                return null;
            }
            if (node.left == null) {
                return node.right;
            }
            if (node.right == null) {
                return node.left;
            }

            let getSmallest = function(node) {
                if (node.left === null && node.right == null) {
                    return node;
                }
                if (node.left != null) {
                    return node.left;
                }
                if (node.right !== null) {
                    return getSmallest(node.right);
                }

            }
            let temNode = getSmallest(node.right);
            node.data = temNode.data;
            node.right = this.removeNode(temNode.right, temNode.data);
            return node;

        } else if (data < node.data) {
            node.left = this.removeNode(node.left, data);
            return node;
        } else {
            node.right = this.removeNode(node.right, data);
            return node;
        }
    }

    find(data) {
        var current = this.root;
        while (current != null) {
            if (data == current.data) {
                break;
            }
            if (data < current.data) {
                current = current.left;
            } else {
                current = current.right
            }
        }
        return current.data;
    }

}
