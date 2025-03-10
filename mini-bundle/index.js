import { readFile } from 'node:fs/promises'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import { transformFromAst } from '@babel/core'

let ID = 0;

async function createAsset(filename) {
    // 读取文件内容
    const content = await readFile(filename, 'utf-8');

    // 构建 ast
    const ast = parse(content, {
        sourceType: 'module',
    });

    // 收集依赖
    const dependencies = [];
    traverse(ast, {
        ImportDeclaration: ({ node }) => {
            dependencies.push(node.source.value);
        }
    });

    const id = ID++;

    // 转译代码
    const { code } = transformFromAst(ast, null, {
        presets: ['@babel/preset-env'],
    });

    return {
        id,
        filename,
        dependencies,
        code,
    }
}

function createGraph(entry) { }