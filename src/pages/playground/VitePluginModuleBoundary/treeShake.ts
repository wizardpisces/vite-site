import { EnvsType } from "./type";

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

export function removeUnUsedIfStatement(ast, envVariables: EnvsType) {
  // 第一次遍历，移除基于环境变量的未使用代码块，removeUnUsedIfStatement
  traverse(ast, {
    IfStatement(path) {
      const test = path.node.test;

      let testPath = path.get("test");
      let canRemove = false,
        composedOfEnvVariables = true;// 判定是否由环境变量控制的
      // 如果测试条件是逻辑表达式（如 IS_MY || IS_ID）
      if (t.isLogicalExpression(testPath)) {
        // 递归检查逻辑表达式中的每个标识符
        traverse(testPath.node, {
          noScope: true,
          Identifier(path) {
            if (!envVariables.hasOwnProperty(path.node.name)) { // 并不是完全由环境变量控制的，eg: if(variable1 || variable2 || IS_MY)
              composedOfEnvVariables = false;
              path.stop();
            }
            if (envVariables[path.node.name] && composedOfEnvVariables) {
              canRemove = true;
              path.stop();
            }
          }
        });
      }

      if ((test.type === 'Identifier' && envVariables.hasOwnProperty(test.name)) || composedOfEnvVariables) {
        if (envVariables[test.name] || canRemove) {
          // 如果条件为 true，检查 consequent 是否是 BlockStatement
          if (path.node.consequent.type === 'BlockStatement') {
            // 使用 BlockStatement 内部的语句数组替换整个 if 语句
            path.replaceWithMultiple(path.node.consequent.body);
          } else {
            // 如果 consequent 不是 BlockStatement，直接替换
            path.replaceWith(path.node.consequent);
          }
        } else {
          // 如果条件为 false，检查 alternate 是否存在
          if (path.node.alternate) {
            // 检查 alternate 是否是 BlockStatement
            if (path.node.alternate.type === 'BlockStatement') {
              // 使用 BlockStatement 内部的语句数组替换整个 if 语句
              path.replaceWithMultiple(path.node.alternate.body);
            } else {
              // 如果 alternate 不是 BlockStatement，直接替换
              path.replaceWith(path.node.alternate);
            }
          } else {
            // 如果没有 alternate 分支，直接移除整个 if 语句
            path.remove();
          }
        }
      }
    }
  });
  return ast
}

export function removeUnUsedReturn(ast) {
  // 遍历 AST
  traverse(ast, {
    BlockStatement(path) {
      // 获取函数体内的语句
      const body = path.node.body;
      for (let i = 0; i < body.length; i++) {
        if (body[i].type === 'ReturnStatement') {
          // 移除 return 语句后的所有语句
          path.node.body = body.slice(0, i + 1);
          break;
        }
      }
    }
  });
  return ast
}


export function removeUnusedImports(ast) {
  // 记录所有的 import 声明和变量
  const imports = new Map();
  traverse(ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value;
      path.node.specifiers.forEach(specifier => {
        const importedName = specifier.local.name;
        if (!imports.has(source)) {
          imports.set(source, new Set());
        }
        imports.get(source).add(importedName);
      });
    }
  });

  // 查找所有被使用的变量
  const usedVariables = new Set();
  traverse(ast, {
    Identifier(path) {
      if (path.isReferencedIdentifier()) {
        usedVariables.add(path.node.name);
      }
    }
  });

  // 删除未被使用的 import 声明
  traverse(ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value;
      path.node.specifiers = path.node.specifiers.filter(specifier => {
        const importedName = specifier.local.name;
        return usedVariables.has(importedName);
      });
      if (path.node.specifiers.length === 0) {
        path.remove();
      }
    }
  });

  return ast
}

export function treeShake(code: string, envVariables: Record<string, boolean>) {
  let ast = parser.parse(code, {
    sourceType: 'module',

    // plugins: ['typescript'] // 如果代码是 TypeScript，由于插件设置为 enforce:post，所以面向的实际是 js code
    plugins: []
  });

  ast = removeUnUsedIfStatement(ast, envVariables)

  ast = removeUnUsedReturn(ast)

  ast = removeUnusedImports(ast)

  // 生成处理后的代码
  const output = generate(ast, {}, code);
  return [output.code, output.map];
}