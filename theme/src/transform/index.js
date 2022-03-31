import loadjs from 'loadjs'

const parsePath = (window._ROOT_PATH || '') + '/asset/script/editor/parses'
const store = {};

const asyncLoad = async (resources, name) => {
    return new Promise((resolve, reject) => {
        if (loadjs.isDefined(name)) {
            resolve()
        } else {
            loadjs(resources, name, {
                success () {
                    resolve()
                },
                error () {
                    reject(new Error('network error'))
                }
            })
        }
    })
}

const asyncMethod = (fn) => {
    if (typeof fn !== "function") {
        throw new Promise.TypeError("fn is not a function.");
    }
    return async function () {
        return Reflect.apply(fn, this, arguments);
    };
};

//#region Vue
const traverseVue2AddProperty = (path, t, data) => {
    path.traverse({
        ObjectExpression (path2) {
            if (path2.parent && path2.parent.type === 'NewExpression') {
                path2.node.properties.push(
                    // el
                    t.objectProperty(
                        t.identifier('el'),
                        t.stringLiteral('#app')
                    ),
                )
                if (data.template && data.template.content) {
                    // template
                    path2.node.properties.push(
                        t.objectProperty(
                            t.identifier('template'),
                            t.stringLiteral(data.template.content)
                        )
                    )
                }
                path2.stop()
            }
        }
    });
}


const parseVue2ScriptPlugin = (data) => {
    return function (babel) {
        let t = babel.types
        return {
            visitor: {
                // 解析export default模块语法
                ExportDefaultDeclaration (path) {
                    // export default -> new Vue
                    path.replaceWith(
                        t.expressionStatement(
                            t.newExpression(
                                t.identifier('Vue'),
                                [
                                    path.get('declaration').node
                                ]
                            )
                        )
                    );
                    // 添加el和template属性
                    traverseVue2AddProperty(path, t, data)
                },
                // 解析module.exports模块语法
                AssignmentExpression (path) {
                    try {
                        let objectNode = path.get('left.object.name')
                        let propertyNode = path.get('left.property.name')
                        if (
                            objectNode &&
                            objectNode.node === 'module' &&
                            propertyNode &&
                            propertyNode.node === 'exports'
                        ) {
                            path.replaceWith(
                                t.newExpression(
                                    t.identifier('Vue'),
                                    [
                                        path.get('right').node
                                    ]
                                )
                            )
                            // 添加el和template属性
                            traverseVue2AddProperty(path, t, data)
                        }
                    } catch (error) {
                        // console.log(error)
                    }
                }
            }
        }
    }
}


const traverseVue3AddProperty = (path, t, data) => {
    let first = true
    path.traverse({
        ObjectExpression (path2) {
            if (first) {
                first = false
                if (data.template && data.template.content) {
                    path2.node.properties.push(
                        // template
                        t.objectProperty(
                            t.identifier('template'),
                            t.stringLiteral(data.template.content)
                        ),
                    )
                }
                path2.stop()
            }
        }
    });
}


const parseVue3ScriptPlugin = (data) => {
    return function (babel) {
        let t = babel.types
        return {
            visitor: {
                // export default -> Vue.create
                ExportDefaultDeclaration (path) {
                    path.replaceWith(
                        t.expressionStatement(
                            t.callExpression(
                                t.memberExpression(
                                    t.callExpression(
                                        t.memberExpression(
                                            t.identifier('Vue'),
                                            t.identifier('createApp')
                                        ),
                                        [
                                            path.get('declaration').node
                                        ]
                                    ),
                                    t.identifier('mount')
                                ),
                                [
                                    t.stringLiteral('#app')
                                ]
                            )
                        )
                    );
                    traverseVue3AddProperty(path, t, data)
                }
            }
        }
    }
}


const parseVueComponentData = async (data, parseVueScriptPlugin) => {
    // 编译html
    if (data.template && data.template.content) {
        let language = data.template.lang || 'html';
        data.template.content = (await run(language, data.template.content)).html;
    }

    // 加载babel解析器
    await asyncLoad(parsePath + '/babel.js', 'babel')
    // babel编译，通过编写插件来完成对ast的修改
    let jsStr = data.script ? window.Babel.transform(data.script.content, {
        presets: [
            'es2015',
            'es2016',
            'es2017',
        ],
        plugins: [
            parseVueScriptPlugin(data)
        ]
    }).code : ''

    // 编译css
    let cssStr = []
    for (let i = 0; i < data.styles.length; i++) {
        let style = data.styles[i];
        let language = style.lang || 'css';
        let cssData = (await run(language, style.content)).css;
        cssStr.push(cssData);
    }
    return {
        html: '<div id="app"></div>',
        javascript: jsStr,
        css: cssStr.join('\r\n')
    }
}
//#endregion

// 代码转换
const loader = {
    plain (type) {
        return (code) => ({
            [type]: code
        });
    },
    // html 预处理
    async loadPug () {
        await asyncLoad(parsePath + '/pug.js', 'pug')
        return (code) => ({
            html: window.pug.render(code)
        })
    },
    async loadEjs () {

    },
    // css 预处理
    async loadLess () {
        const less = await import(/* webpackChunkName: "parses/less.js" */ 'less')
        return (code) => less.render(code).then(output => ({ css: output.css }))
    },
    async loadSass () {
        await asyncLoad(parsePath + '/sass.js', 'sass')
        window.Sass.setWorkerUrl(parsePath + '/sass.worker.js')
        const sass = new Sass();
        return (code, language) => {
            return new Promise((resolve) => {
                sass.compile(code, {
                    indentedSyntax: language === 'sass'
                }, (result) => {
                    resolve({ css: result.text })
                })
            })
        }
    },
    async loadStylus () {
        await asyncLoad(parsePath + '/stylus.js', 'stylus')
        return (code) => {
            return new Promise((resolve, reject) => {
                window.stylus.render(code, { filename: 'code.styl' }, (err, css) => {
                    if (err) return reject(err)
                    resolve({ css })
                })
            })
        }
    },
    // js 预处理
    async loadTypeScript () {
        await asyncLoad(parsePath + '/typescript.js', 'typescript')
        return (code) => ({
            javascript: window.typescript.transpileModule(code, {
                reportDiagnostics: true,
                compilerOptions: {
                    module: 'es2015'
                }
            }).outputText
        })
    },
    async loadBabel () {
        await asyncLoad(parsePath + '/babel.js', 'babel')
        return (code) => ({
            javascript: window.Babel.transform(code, {
                presets: [
                    'es2015',
                    'es2016',
                    'es2017',
                    'react'
                ]
            }).code
        })
    },
    async loadCoffeeScript () {
        await asyncLoad(parsePath + '/coffeescript.js', 'coffeescript')
        return (code) => ({
            javascript: coffeeScript.compile(code)
        })
    },
    // vue
    async loadVue2 () {
        await asyncLoad(parsePath + '/vue2.js', 'vue2')
        return (code) => {
            let componentData = VueTemplateCompiler.parseComponent(code);
            return parseVueComponentData(componentData, parseVue2ScriptPlugin);
        }
    },
    async loadVue3 () {
        await asyncLoad(parsePath + '/vue3.js', 'vue3')

        return async (code) => {
            let componentData = Vue3TemplateCompiler.parse(code);

            if (componentData.descriptor.scriptSetup) {
                componentData.descriptor.script = null;
                let compiledScript = Vue3TemplateCompiler.compileScript(componentData.descriptor, {
                    refSugar: true,
                    id: 'scoped'
                });
                componentData.descriptor.script = {
                    content: compiledScript.content
                };
            }

            let preview = await parseVueComponentData(componentData.descriptor, parseVue3ScriptPlugin);
            preview.javascript = preview.javascript.replace('"use strict";', `
"use strict";
if (!window.require) {
    window.require = function(tar) {
        return tar === 'vue' ? window.Vue : window[tar];
    }
}`);
            return preview
        }
    }
}


// 注册
export const register = (language, run) => {
    let transform = {
        language,
        run: asyncMethod(run)
    }
    store[language] = transform;
    return transform
}

// 加载
export const load = async (language) => {
    let tran = store[language]
    if (tran) {
        return tran
    } else {
        switch (language) {
            case 'html':
            case 'css':
            case 'javascript':
                return register(language, loader.plain(language));
            case 'pug':
                return register(language, await loader.loadPug());
            case 'less':
                return register(language, await loader.loadLess());
            case 'scss':
            case 'sass':
                return register(language, await loader.loadSass());
            case 'stylus':
                return register(language, await loader.loadStylus())
            case 'typescript':
                return register(language, await loader.loadTypeScript());
            case 'babel':
                return register(language, await loader.loadBabel());
            case 'coffeescript':
                return register(language, await loader.loadCoffeeScript());
            case 'vue2':
                return register(language, await loader.loadVue2())
            case 'vue3':
                return register(language, await loader.loadVue3());
            default:
                break;
        }
    }
}

// 运行
export const run = async (language, text) => {
    let transform = await load(language)
    if (transform) {
        return transform.run(text, language)
    } else {
        throw new Error(`未找到 ${language} 转换器`)
    }
}

export default {
    register,
    load,
    run
}