"use strict";

var isProcuction = process.env.NODE_ENV === "production";

module.exports = function (_ref) {
  var t = _ref.types,
      template = _ref.template;

  return {
    visitor: {
      CallExpression(path, state, scope) {
        if (path.node.callee && t.isIdentifier(path.node.callee.object, { name: "console" })) {
          var env = state.opts.env;

          if (env === 'production' || isProcuction) {
            removeConsoleExpression(path, state);
          }
        }
      }
    }
  };
};

function isReserveComment(node, state) {
  var removeMethods = state.opts.removeMethods;

  if (removeMethods && typeof removeMethods === "function") {
    return removeMethods(node.value);
  }
  return ["CommentBlock", "CommentLine"].includes(node.type) && /(no[t]? remove\b)|(reserve\b)/.test(node.value);
}

function hasLeadingComments(node) {
  var leadingComments = node.leadingComments;
  return leadingComments && leadingComments.length;
}

function hasTrailingComments(node) {
  var trailingComments = node.trailingComments;
  return trailingComments && trailingComments.length;
}

function removeConsoleExpression(path, state) {
  var parentPath = path.parentPath;
  var node = parentPath.node;

  var leadingReserve = false;
  var trailReserve = false;

  if (hasLeadingComments(node)) {
    node.leadingComments.forEach(function (comment) {
      if (isReserveComment(comment, state) && !comment.belongPrevTrail) {
        leadingReserve = true;
      }
    });
  }
  if (hasTrailingComments(node)) {
    node.trailingComments.forEach(function (comment) {
      var commentLine = comment.loc.start.line;
      var expressionLine = node.expression.loc.start.line;

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