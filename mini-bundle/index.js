import { readFile } from "node:fs/promises";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import { transformFromAst } from "@babel/core";
import path from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";
let ID = 0;

async function createAsset(filename) {
  // 读取文件内容
  const content = await readFile(filename, "utf-8");

  // 构建 ast
  const ast = parse(content, {
    sourceType: "module",
  });

  // 收集依赖
  const dependencies = [];
  traverse.default(ast, {
    ImportDeclaration: ({ node }) => {
      dependencies.push(node.source.value);
    },
  });

  const id = ID++;

  // 转译代码
  const { code } = transformFromAst(ast, null, {
    presets: ["@babel/preset-env"],
  });

  return {
    id,
    filename,
    dependencies,
    code,
  };
}

async function createGraph(entry) {
  const mainAsset = await createAsset(entry);

  // 记录所有的模块资产
  const queue = [mainAsset];

  // 广度优先遍历
  for (const asset of queue) {
    // 记录模块的依赖关系
    // 映射模块 id 和 模块路径
    asset.mapping = {};
    // 获取模块的目录
    const dirname = path.dirname(asset.filename);

    for (const relativePath of asset.dependencies) {
      // 获取绝对路径
      const absolutePath = path.join(dirname, relativePath);
      // 创建子模块
      const child = await createAsset(absolutePath);
      // 记录模块的依赖关系
      asset.mapping[relativePath] = child.id;
      // 将子模块添加到队列中
      queue.push(child);
    }
  }

  return queue;
}

function bundle(graph) {
  let modules = "";

  graph.forEach(mod => {
    modules += `${mod.id}: [
      function(require, module, exports) {
        ${mod.code}
      },
      ${JSON.stringify(mod.mapping)}
    ],
    `;
  });

  return `
    (function(modules) {
      function require(id) {
        const [fn, mapping] = modules[id];
        function localRequire(name) {
          return require(mapping[name]);
        }
        const module = { exports: {} };
        fn(localRequire, module, module.exports);
        return module.exports;
      }
      require(0);
    })({${modules}})
  `;
}

(async () => {
  const graph = await createGraph("./example/entry.js");
  const bundleCode = bundle(graph);

  mkdirSync("./dist", { recursive: true });
  writeFileSync("./dist/bundle.js", bundleCode);
})();
