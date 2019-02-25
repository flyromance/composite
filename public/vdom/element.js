function createVnode(tag, props, ...children) {
  let _children = flatten(children);
  return new Node(tag, props, _children);
}

class Node {
  constructor(tag, props, children, key) {
    this.tag = tag;
    this.props = props || {};
    this.children = children;
    this.key = key;
  }

  render(container) {
    let el = createElement(this);
    if (typeof container === "string") {
      container = document.querySelector(container);
    }
    return container.appendChild(el);
  }

  createElement() {
    return createElement(this);
  }
}

function createElement(vnode) {
  if (typeof vnode === "string") {
    return document.createTextNode(vnode);
  }

  let { tag, props, children, key } = vnode;

  let elem = document.createElement(tag);

  if (props) {
    Object.keys(props).forEach(function(propName) {
      elem.setAttribute(propName, props[propName]);
    });
  }

  if (key) {
    el.setAttribute("key", key);
  }

  if (children && children.length) {
    children.forEach(function(child) {
      let childElem = createElement(child);
      elem.appendChild(childElem);
    });
  }

  return elem;
}
