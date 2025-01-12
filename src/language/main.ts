import { startLanguageServer } from 'langium/lsp';
import { NodeFileSystem } from 'langium/node';
import { createConnection, Diagnostic, NotificationType, ProposedFeatures } from 'vscode-languageserver/node.js';
import { createCardDslServices } from './card-dsl-module.js';
import { DocumentState } from 'langium';

// Create a connection to the client
const connection = createConnection(ProposedFeatures.all);

// Inject the shared services and language-specific services
const services = createCardDslServices({ connection, ...NodeFileSystem });

// Start the language server with the shared services
startLanguageServer(services.shared);

type DocumentChange = { uri: string, content: string, diagnostics: Diagnostic[] };
const documentChangeNotification = new NotificationType<DocumentChange>('browser/DocumentChange');
const jsonSerializer = services.CardDsl.serializer.JsonSerializer;

services.CardDsl.shared.workspace.DocumentBuilder.onBuildPhase(DocumentState.Validated, documents => {
    for (const document of documents) {
        const json = jsonSerializer.serialize(document.parseResult.value);
        connection.sendNotification(documentChangeNotification, {
            uri: document.uri.toString(),
            content: json,
            diagnostics: document.diagnostics ?? []
        });
    }
});