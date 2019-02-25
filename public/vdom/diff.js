function diff(oldVnode, newVnode) {
  let patches = {};
  let index = 0;
  diffNode(oldVnode, newVnode, index, patches);
  return patches;
}

function diffNode(oldVnode, newVnode, index, patches) {
  let patch = [];

  if (oldVnode.tag === newVnode.tag && oldVnode.key == newVnode.key) {
    // 对比属性
    let propPatches = diffProps(oldVnode.props, newVnode.props);
    if (propPatches.length) patch.push({ type: "prop", value: propPatches });

    // 对比子节点
    diffChildren(oldVnode.children, newVnode.children, index, patches);
  } else {
    patch.push({ type: "replaceNode", node: newNode });
  }

  if (patch.length) {
    if (patches[index]) {
      patches[index] = patches[index].concat(patch);
    } else {
      patches[index] = patch;
    }
  }
}

function diffChildren(oldChildren, newChildren, index, patches) {
  let { changes, list } = diffList(oldChildren, newChildren);
}

function diffList(oldList, newList) {}

function diffProps(oldProps = {}, newProps = {}) {
  let ret = [];
  let oldPropNames = Object.keys(oldProps);
  let newPropNames = Object.keys(newProps);

  oldPropNames.forEach(function(propName) {
    if (newPropNames.indexOf(propName) === -1) {
      // 删除
      ret.push({ type: "delete", propName });
    } else {
      ret.push({ type: "change", propName, propValue: newProps[propName] });
    }
  });

  newPropNames.forEach(function(propName) {
    if (oldPropNames.indexOf(propName) === -1) {
      // 新增
      ret.push({ type: "add", propName, propValue: newProps[propName] });
    }
  });

  return ret;
}
