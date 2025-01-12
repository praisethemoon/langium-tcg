import type { LanguageClientOptions, ServerOptions} from 'vscode-languageclient/node.js';
import * as vscode from 'vscode';
import * as path from 'node:path';
import { LanguageClient, TransportKind } from 'vscode-languageclient/node.js';
import { commands } from 'vscode';
import { CardPreviewPanel } from './CardPreviewPanel.js';
import { Messenger } from 'vscode-messenger';

let client: LanguageClient;
const messenger = new Messenger();


// This function is called when the extension is activated.
export function activate(context: vscode.ExtensionContext) {
    const showCardPreviewCommand = commands.registerCommand("cardDSLPreview.start", () => {
        CardPreviewPanel.render(context.extensionUri, messenger);
    });
    // Add command to the extension context
    context.subscriptions.push(showCardPreviewCommand);


    client = startLanguageClient(context);

    // capture notifications from the language server
    client.onNotification("browser/DocumentChange", (params) => {
        console.log("document validated:",params);

        const uri = params.uri;

        // check if the URI is the active document, if so, send the notification to the webview
        if (uri === vscode.window.activeTextEditor?.document.uri?.toString()) {
            messenger.sendNotification({ method: 'updateCard' }, {type: 'webview', webviewType: 'showCardPreview' }, {
                content: params.content
            });
        }
    });
    

    return messenger.diagnosticApi();
}


// This function is called when the extension is deactivated.
export function deactivate(): Thenable<void> | undefined {
    if (client) {
        return client.stop();
    }
    return undefined;
}

function startLanguageClient(context: vscode.ExtensionContext): LanguageClient {
    const serverModule = context.asAbsolutePath(path.join('out', 'language', 'main.cjs'));
    // The debug options for the server
    // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging.
    // By setting `process.env.DEBUG_BREAK` to a truthy value, the language server will wait until a debugger is attached.
    const debugOptions = { execArgv: ['--nolazy', `--inspect${process.env.DEBUG_BREAK ? '-brk' : ''}=${process.env.DEBUG_SOCKET || '6009'}`] };

    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    const serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
    };

    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: '*', language: 'card-dsl' }]
    };

    // Create the language client and start the client.
    const client = new LanguageClient(
        'card-dsl',
        'CardDSL',
        serverOptions,
        clientOptions
    );

    // Start the client. This will also launch the server
    client.start();
    return client;
}
