const isProcuction = process.env.NODE_ENV === "production";

module.exports = ({ types: t, template }) => {
  return {
    visitor: {
      CallExpression(path, state, scope) {
        if (
          path.node.callee &&
          t.isIdentifier(path.node.callee.object, { name: "console" })
        ) {
          const { env } = state.opts;
          if (env === 'production' || isProcuction) {
            removeConsoleExpression(path, state);
          }
        }
      },
    },
  };
};

function isReserveComment(node, state) {
  const { removeMethods } = state.opts;
  if (removeMethods && typeof removeMethods === "function") {
    return removeMethods(node.value);
  }
  return (
    ["CommentBlock", "CommentLine"].includes(node.type) &&
    /(no[t]? remove\b)|(reserve\b)/.test(node.value)
  );
}

function hasLeadingComments(node) {
  const leadingComments = node.leadingComments;
  return leadingComments && leadingComments.length;
}

function hasTrailingComments(node) {
  const trailingComments = node.trailingComments;
  return trailingComments && trailingComments.length;
}

function removeConsoleExpression(path, state) {
  const parentPath = path.parentPath;
  const node = parentPath.node;

  let leadingReserve = false;
  let trailReserve = false;

  if (hasLeadingComments(node)) {
    node.leadingComments.forEach((comment) => {
      if (isReserveComment(comment, state) && !comment.belongPrevTrail) {
        leadingReserve = true;
      }
    });
  }
  if (hasTrailingComments(node)) {
    node.trailingComments.forEach((comment) => {
      const {loc: {start: { line: commentLine }}} = comment;
      const { loc: { start: { line: expressionLine } } } = node.expression;
      if (commentLine === expressionLine) {
        comment.belongPrevTrail = true;
      }
      if (isReserveComment(comment, state) && comment.belongPrevTrail) {
        trailReserve = true;
      }
    });
  }
  if (!leadingReserve && !trailReserve) {
    path.remove();
  }
}
