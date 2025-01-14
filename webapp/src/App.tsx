import { DocumentChange, Editor } from './components/Editor'
import { useState } from 'react';
import { QuestionableCard } from '../../card-webview/src/components/cards/QuestionableCard';
import { Card } from '../../card-webview/src/components/cards/Card';
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import { BaseCard } from '../../src/language/generated/ast';

function App() {
    const [cards, setCards] = useState<BaseCard[]>([]);

    const onChange = (change: DocumentChange) => {
        setCards([JSON.parse(change.content[0])]);
    };

    return (
        <div className="w-screen h-screen flex flex-row">
            <Allotment>
                <Editor onLoad={(editor) => {
                    const lc = editor.getEditorWrapper()?.getLanguageClient();
                    if (!lc) throw new Error("Language client not found");
                    lc.onNotification("browser/DocumentChange", onChange);
                }} style={{ width: "100%", height: "100%" }} />
                <Allotment vertical={true}>
                    <div className="h-full w-full overflow-y-auto p-4">
                        {cards.length==0 && <QuestionableCard />}
                        {cards.length>0 && <Card card={cards[0]} />}
                    </div>
                </Allotment>
            </Allotment>
        </div>
    )
}

export default App
