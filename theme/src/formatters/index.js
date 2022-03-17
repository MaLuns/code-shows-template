import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import css_beautify from 'js-beautify/js/src/css'

export const cssFormatter = function (languages = ["css", "less", "scss"], beautyOption = {}) {

    const documentProvider = {
        provideDocumentFormattingEdits: (model) => {
            const lineCount = model.getLineCount();
            return [
                {
                    range: new monaco.Range(1, 1, lineCount, model.getLineMaxColumn(lineCount) + 1),
                    text: css_beautify(model.getValue(), beautyOption)
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
                    text: css_beautify(code, beautyOption)
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