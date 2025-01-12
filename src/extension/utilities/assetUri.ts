import { Uri, Webview } from "vscode";

/**
 * Converts a relative asset path to a VSCode webview URI
 * @param webview The webview instance
 * @param extensionUri The extension's URI
 * @param assetPath The relative path to the asset
 * @returns The webview URI for the asset
 */
export function getAssetUri(webview: Webview, extensionUri: Uri, assetPath: string): string {
    return webview.asWebviewUri(
        Uri.joinPath(extensionUri, "card-webview", "build", assetPath)
    ).toString();
} 