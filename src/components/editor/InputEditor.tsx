import { Editor, useMonaco } from "@monaco-editor/react";
import { useEffect, useRef } from "react";
import { useQueryHandlingUtils } from "../query-handler/QueryHandlingProvider";
import './InputEditor.css';
interface InputEditorProps {
    handleQueryInput: (val: string) => void,
    setLineHeight: (lh: number) => void,
    setFontSize: (fs: number) => void
}

export function InputEditor(props: InputEditorProps) {
    const monaco = useMonaco();

    const viewZonesRef = useRef<string[]>([]);

    const { setLineHeight, setFontSize } = props;

    const { updateQuery, queryResult } = useQueryHandlingUtils();

    const editorRef = useRef<any>();

    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor;
        // Options are offset by 1 apparently https://microsoft.github.io/monaco-editor/docs.html#enums/editor.EditorOption.html
        setFontSize(editor.getOption(52 - 1));
        setLineHeight(editor.getOption(66 - 1));
    };

    useEffect(() => {
        if (editorRef.current) {
            const viewZones: any[] = [];
            const decorations: any[] = [];

            queryResult.lines.forEach((line, i) => {
                decorations.push({
                    range: new monaco.Range(i + 1, 1, i + 1, 1),
                options: { className: `myInlineDecoration-${(i + 1) % 6}`, isWholeLine: true }
                })

                if (line.expanded) {
                    let domNode = document.createElement('div');
                    domNode.style.backgroundColor = '#eee';
                    const viewZone = {
                        afterLineNumber: i + 1,
                        heightInLines: line.resultRows.length,
                        domNode
                    };

                    viewZones.push(viewZone);
                }
            })
            
            editorRef.current.changeViewZones((changeAccessor: any) => {
                viewZonesRef.current.forEach((zoneId) => {
                    changeAccessor.removeZone(zoneId);
                })
                viewZonesRef.current = [];
                viewZones.forEach((viewZone) => {
                    viewZonesRef.current.push(changeAccessor.addZone(viewZone));
                })
            });

            editorRef.current.createDecorationsCollection(decorations);
        }
    }, [queryResult])

    return <Editor width="45vw" defaultLanguage="saneql" value={queryResult.lines.map((line) => line.displayString).join("\n")}
        onChange={updateQuery} onMount={handleEditorDidMount} />;
}