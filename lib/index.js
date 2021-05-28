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

// 通过key值标记兄弟节点
var nextSibilingKey = null;
function removeConsoleExpression(path, state) {
  var parentPath = path.parentPath;
  var node = parentPath.node;

  var leadingReserve = false;
  var trailReserve = false;

  if (hasLeadingComments(node)) {
    // 遍历到下个兄弟节点 筛除属于上个节点的comment
    // if (parentPath.key === nextSibilingKey) {
    //   node.leadingComments = node.leadingComments.filter(comment => !comment.belongPrevTrail)
    // }
    // 遍历所有的前缀注释
    node.leadingComments.forEach(function (comment) {
      // 有保留字 并且不是上个兄弟节点的尾注释
      if (isReserveComment(comment, state) && !comment.belongPrevTrail) {
        leadingReserve = true;
      }
    });
  }
  if (hasTrailingComments(node)) {
    // 遍历所有的后缀注释
    node.trailingComments.forEach(function (comment) {
      var commentLine = comment.loc.start.line;
      // 保留下一个sibling节点key

      nextSibilingKey = parentPath.key + 1;

      // 对于尾部注释 需要标记出 该注释是属于当前的尾部 还是属于下个节点的头部 通过其所属的行来判断
      var expressionLine = node.expression.loc.start.line;

      if (commentLine === expressionLine) {
        comment.belongPrevTrail = true;
      }
      // 有保留字 并且是本行的
      if (isReserveComment(comment, state) && comment.belongPrevTrail) {
        trailReserve = true;
      }
    });
  }
  if (!leadingReserve && !trailReserve) {
    path.remove();
  }
}