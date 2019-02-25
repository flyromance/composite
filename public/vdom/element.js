function createVnode(tag, props, ...children) {
  console.log(children);
  let _children = flatten(children);

  return {
    tag,
    props,
    children: _children
  };
}

function createElement(vnode) {
  if (typeof vnode === "string") {
    return document.createTextNode(vnode);
  }

  let { tag, props, children } = vnode;

  let elem = document.createElement(tag);

  if (props) {
    Object.keys(props).forEach(function(propName) {
      elem.setAttribute(propName, props[propName]);
    });
  }

  if (children && children.length) {
    children.forEach(function(child) {
      let childElem = createElement(child);
      elem.appendChild(childElem);
    });
  }

  return elem;
}
