import { QuestionableCard } from './components/cards/QuestionableCard';
import { Messenger } from 'vscode-messenger-webview';
import { Card } from './components/cards/Card';
import { BaseCard } from '../../src/language/generated/ast';
import React, { useState } from 'react';

/** @ts-expect-error valid call within vscode webview  */
const vscode = acquireVsCodeApi();

// Messenger to communicate with the extension
const messenger = new Messenger(vscode);
messenger.start();


function App() {
    const [card, setCard] = useState<BaseCard | null>(null);

    React.useEffect(() => {
        messenger.onNotification({method: 'updateCard'}, (params: {content: string}) => {
            const card = JSON.parse(params.content)?.cards[0];
            setCard(card ?? null);
        });
    }, []);

    return (
        <div className="w-screen h-screen flex flex-row text-black bg-white">
            {(card == null) && <QuestionableCard />}
            {(card != null) && <Card card={card} />}
        </div>
    )
}

export default App
