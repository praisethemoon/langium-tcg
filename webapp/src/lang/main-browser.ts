import { DocumentState, EmptyFileSystem } from 'langium';
import { startLanguageServer } from 'langium/lsp';
import { BrowserMessageReader, BrowserMessageWriter, createConnection, Diagnostic, NotificationType } from 'vscode-languageserver/browser.js';
import { createCardDslServices } from '../../../src/language/card-dsl-module.js';
import { Model } from '../../../src/language/generated/ast.js';

declare const self: DedicatedWorkerGlobalScope;

type DocumentChange = { uri: string, content: string[], diagnostics: Diagnostic[], state: DocumentState };

try {
    console.log("Starting Card DSL Language Server in browser");
    // Initialize browser-based message handling
    const messageReader = new BrowserMessageReader(self);
    const messageWriter = new BrowserMessageWriter(self);

    // Create the language server connection
    const connection = createConnection(messageReader, messageWriter);

    // Create language services with empty filesystem
    const { shared, CardDsl } = createCardDslServices({
        connection,
        ...EmptyFileSystem
    });

    // Start the language server
    startLanguageServer(shared);

    // Log successful initialization
    console.info("Card DSL Language Server started in browser");


    // Listen for messages from the main threadtype DocumentChange = { uri: string, content: string, diagnostics: Diagnostic[] };
    const documentChangeNotification = new NotificationType<DocumentChange>('browser/DocumentChange');
    // use the built-in AST serializer
    const jsonSerializer = CardDsl.serializer.JsonSerializer;
    // listen on fully validated documents
    shared.workspace.DocumentBuilder.onBuildPhase(DocumentState.Validated, documents => {
        // perform this for every validated document in this build phase batch
        for (const document of documents) {
            if (document.state === DocumentState.Validated) {
                try {
                    const model = document.parseResult.value as Model;
                    
                    const jsonResults = [];

                    for (const card of model.cards) {
                        const json = jsonSerializer.serialize(card, {
                            comments: true,
                            space: 4
                        });
                        jsonResults.push(json);
                    }

                    // send the notification for this validated document,
                    // with the serialized AST + generated commands as the content
                    connection.sendNotification(documentChangeNotification, {
                        uri: document.uri.toString(),
                        content: jsonResults,
                        state: document.state,
                        diagnostics: document.diagnostics ?? []
                    });
                } catch (error) {
                    console.error("Failed to parse/serialize document:", error);
                }
            }
        }
    });
} catch (error) {
    console.error("Failed to start Card DSL Language Server:", error);
    throw error;
}
