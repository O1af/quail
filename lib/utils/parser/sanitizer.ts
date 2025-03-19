import { NodePath, PluginObj, types as t } from "@babel/core";

export default function safePlugin(): PluginObj {
  return {
    visitor: {
      Identifier(path: NodePath<t.Identifier>) {
        const forbidden = ["eval", "window", "document"];
        if (forbidden.includes(path.node.name)) {
          throw path.buildCodeFrameError(
            `Usage of "${path.node.name}" is not allowed.`
          );
        }
      },
      CallExpression(path: NodePath<t.CallExpression>) {
        if (
          t.isIdentifier(path.node.callee) &&
          path.node.callee.name === "eval"
        ) {
          throw path.buildCodeFrameError(
            "Direct use of eval() is not allowed."
          );
        }
      },
      MemberExpression(path: NodePath<t.MemberExpression>) {
        if (
          t.isIdentifier(path.node.object, { name: "window" }) ||
          t.isIdentifier(path.node.object, { name: "document" })
        ) {
          throw path.buildCodeFrameError(
            `Accessing ${path.node.object.name} is not allowed.`
          );
        }
      },
      // Optionally, disallow import declarations entirely:
      ImportDeclaration(path) {
        throw path.buildCodeFrameError("Import declarations are not allowed.");
      },
      // You can extend this plugin with further checks as needed.
    },
  };
}
