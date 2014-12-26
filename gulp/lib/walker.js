function tag(node, cb) {
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

module.exports = {
	tag: tag
};
