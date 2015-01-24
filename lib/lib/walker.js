function tag(node, cb) {
  if (!node) return;
  var children = node.children, l, child;
  if (children && (l = children.length)) {
    for (var i = 0; i < l; i++) {
      child = children[i];
      if (child.type === 'tag') {
        cb(child);
        tag(child, cb);
      }
    }
  }
}

function tags(nodes, cb) {
  nodes = nodes || [];
  var i = 0, l = nodes.length, node;
  if (l) {
    for (; i < l; i++) {
      node = nodes[i];
      if (node.type === 'tag') {
        cb(node);
        tags(node.children, cb);
      }
    }
  }
}

function text(node, cb) {
  if (!node) return;
  var children = node.children, l, child;
  if (children && (l = children.length)) {
    for (var i = 0; i < l; i++) {
      child = children[i];
      if (child.type === 'text') {
        cb(child);
      } else {
        text(child, cb);
      }
    }
  }
}

module.exports = {
  tag: tag,
  tags: tags,
  text: text
};
