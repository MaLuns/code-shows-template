import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import cssBeautify from 'js-beautify/js/src/css'
import pugBeautify from 'pug-beautify';

// 格式化 css,less,scss,stylus
export const cssFormatter = function (languages = ["css", "less", "scss", "sass", "stylus"], beautyOption = {}) {
    const documentProvider = {
        provideDocumentFormattingEdits: (model) => {
            const lineCount = model.getLineCount();
            return [
                {
                    range: new monaco.Range(1, 1, lineCount, model.getLineMaxColumn(lineCount) + 1),
                    text: cssBeautify(model.getValue(), beautyOption)
                }
            ];
        }
    };

    const rangeProvider = {
        provideDocumentRangeFormattingEdits: (model, range) => {
            const fullLineRange = new monaco.Range(
                range.startLineNumber,
                1,
                range.endLineNumber,
                model.getLineMaxColumn(range.endLineNumber) + 1
            );

            const code = model.getValueInRange(fullLineRange);

            return [
                {
                    range: fullLineRange,
                    text: cssBeautify(code, beautyOption)
                }
            ];
        }
    };

    const disposeArr = languages.map(language => {
        return [
            monaco.languages.registerDocumentFormattingEditProvider(
                language,
                documentProvider
            ),
            monaco.languages.registerDocumentRangeFormattingEditProvider(
                language,
                rangeProvider
            )
        ];
    });

    return () => {
        disposeArr.forEach(arr => arr.forEach(disposable => disposable.dispose()));
    };
}

// 格式化 Pug
export const pugFormater = function (beautyOption = {
    fill_tab: true,
    omit_div: false,
    tab_size: 4
}) {

    const documentProvider = {
        provideDocumentFormattingEdits: (model) => {
            const lineCount = model.getLineCount();
            return [
                {
                    range: new monaco.Range(1, 1, lineCount, model.getLineMaxColumn(lineCount) + 1),
                    text: pugBeautify(model.getValue(), beautyOption)
                }
            ];
        }
    };

    const rangeProvider = {
        provideDocumentRangeFormattingEdits: (model, range) => {
            const fullLineRange = new monaco.Range(
                range.startLineNumber,
                1,
                range.endLineNumber,
                model.getLineMaxColumn(range.endLineNumber) + 1
            );

            const code = model.getValueInRange(fullLineRange);

            return [
                {
                    range: fullLineRange,
                    text: pugBeautify(code, beautyOption)
                }
            ];
        }
    };

    const disposeArr = [
        monaco.languages.registerDocumentFormattingEditProvider('pug', documentProvider),
        monaco.languages.registerDocumentRangeFormattingEditProvider('pug', rangeProvider)
    ];

    return () => {
        disposeArr.forEach(arr => arr.forEach(disposable => disposable.dispose()));
    };
}