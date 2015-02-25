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

module.exports = {
  tags: tags
};
