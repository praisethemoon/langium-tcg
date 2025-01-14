import { MonacoEditorReactComp } from "@typefox/monaco-editor-react";
import { useRef, useEffect } from "react";
import { Diagnostic } from "vscode-languageserver";
import { DocumentState } from "langium";
import { setupConfigExtended } from "../lang/setupExtended";
import { configureMonacoWorkers } from "../lang/setupCommon";

export type DocumentChange = { uri: string, content: string, diagnostics: Diagnostic[], state: DocumentState };

configureMonacoWorkers();
const userConfig = setupConfigExtended();

type EditorProps = {
    onLoad: (editor: MonacoEditorReactComp) => void;
    style?: React.CSSProperties;
}

export const Editor = ({ onLoad, style }: EditorProps) => {
    const editorRef = useRef<MonacoEditorReactComp | null>(null);
    const mountedRef = useRef(false);

    useEffect(() => {
        if (!mountedRef.current) {
            mountedRef.current = true;
            return;
        }

        return () => {
            // Cleanup editor instance
            if (editorRef.current) {
                const wrapper = editorRef.current.getEditorWrapper();
                wrapper?.dispose();
            }
        };
    }, []);

    return (
        <MonacoEditorReactComp
            ref={editorRef}
            userConfig={userConfig}
            style={style}
            onLoad={() => {
                if (mountedRef.current && onLoad && editorRef.current) {
                    onLoad(editorRef.current);
                }
            }}
        />
    );
}