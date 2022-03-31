import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { Registry } from 'monaco-textmate'
import { wireTmGrammars } from 'monaco-editor-textmate'
import { loadWASM } from "onigasm"
import { monacoEditorInnerLanguages, scopeNameMap, tmGrammarJsonMap } from '../config'

const cacheTheme = {}
const basepath = (window._ROOT_PATH || '') + '/asset/script/editor'
let hasGetWorkUrl = false

// 初始化编辑器
export const initMonacoEditor = async () => {
    // 加载onigasm的WebAssembly文件
    await loadWASM(`${basepath}/onigasm/onigasm.wasm`)
    // 配置编辑器运行环境
    window.MonacoEnvironment = {
        getWorkerUrl: function (moduleId, label) {
            hasGetWorkUrl = true
            if (label === 'json') {
                return `${basepath}/worker/json.worker.min.js`
            }
            if (label === 'css' || label === 'scss' || label === 'less') {
                return `${basepath}/worker/css.worker.min.js`
            }
            if (label === 'html' || label === 'handlebars' || label === 'razor') {
                return `${basepath}/worker/html.worker.min.js`
            }
            if (label === 'typescript' || label === 'javascript') {
                return `${basepath}/worker/ts.worker.min.js`
            }
            return `${basepath}/worker/editor.worker.min.js`
        },
    }
}

// 创建语法关联
export const liftOff = async (languageId, editor) => {
    if (!scopeNameMap[languageId]) {
        return
    }
    // 语言id到作用域名称的映射
    const grammars = new Map()
    grammars.set(languageId, scopeNameMap[languageId])

    // 创建一个注册表，可以从作用域名称创建语法
    const registry = new Registry({
        getGrammarDefinition: async (scopeName) => {
            let jsonMap = tmGrammarJsonMap[scopeName]
            if (!jsonMap) {
                return null
            }
            let format = 'json'
            let path = jsonMap
            if (typeof jsonMap !== 'string') {
                format = jsonMap.format
                path = jsonMap.path
            }
            return {
                format,
                content: await (await fetch(`${basepath}/grammars/${path}`)).text()
            }
        }
    })

    // 注册语言
    if (!monacoEditorInnerLanguages.includes(languageId)) {
        monaco.languages.register({ id: languageId })
    }

    // fix：https://github.com/Microsoft/monaco-editor/issues/884
    let loop = () => {
        if (hasGetWorkUrl) {
            Promise.resolve().then(async () => {
                await wireTmGrammars(monaco, registry, grammars, editor)
            })
        } else {
            setTimeout(() => {
                loop()
            }, 100)
        }
    }
    loop()
}

// 加载主题
export const loadTheme = async (name) => {
    if (cacheTheme[name]) {
        monaco.editor.setTheme(name)
    } else {
        let themeData = await (await fetch(`${basepath}/vsctheme/${name}.json`)).json()
        cacheTheme[name] = themeData
        monaco.editor.defineTheme(name, themeData)
        monaco.editor.setTheme(name)
    }
}