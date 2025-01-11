import { beforeAll, describe, expect, test } from "vitest";
import { EmptyFileSystem, type LangiumDocument } from "langium";
import { expandToString as s } from "langium/generate";
import { parseHelper } from "langium/test";
import type { Diagnostic } from "vscode-languageserver-types";
import { createCardDslServices } from "../../src/language/card-dsl-module.js";
import { Model, isModel } from "../../src/language/generated/ast.js";

let services: ReturnType<typeof createCardDslServices>;
let parse:    ReturnType<typeof parseHelper<Model>>;
let document: LangiumDocument<Model> | undefined;

beforeAll(async () => {
    services = createCardDslServices(EmptyFileSystem);
    const doParse = parseHelper<Model>(services.CardDsl);
    parse = (input: string) => doParse(input, { validation: true });

    // activate the following if your linking test requires elements from a built-in library, for example
    // await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
});

describe('Validating', () => {
    test("should detect that the monster is too powerful", async () => {
        document = await parse(`
name: "Ifrit" 
id: 1
type: monster
category: fire
artwork: "https://manacards.s3.fr-par.scw.cloud/cards/ifrit.webp"
traits: spellcaster
attack: 10001
hp: 1000
stars: 10
description: "Lord of fire and destruction"
abilities:
    [active] "Annihilation":
        description: "Destroy all monsters on the field except for Ifrit"
        auto select $allCards from the battlefield where($allCards.category = fire)
        [effect] destroy $allCards
        `);
        
        const diagnostics = document.diagnostics ?? [];
        expect(checkDocumentValid(document)).toBeUndefined();
        expect(diagnostics).toHaveLength(1);
        expect(diagnostics[0].message).toContain("Monster too powerful. Heard about game balance?");
    });

    test("should detect invalid health = 0", async () => {
        document = await parse(`
name: "Ifrit" 
id: 1
type: monster
category: fire
artwork: "https://manacards.s3.fr-par.scw.cloud/cards/ifrit.webp"
traits: spellcaster
attack: 3000
hp: 0
stars: 10
description: "Lord of fire and destruction"
abilities:
    [active] "Annihilation":
        description: "Destroy all monsters on the field except for Ifrit"
        auto select $allCards from the battlefield where($allCards.category = fire)
        [effect] destroy $allCards
        `);
        
        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics).toHaveLength(1);
        expect(diagnostics[0].message).toContain("Monster health must be greater than 0.");
    });

    test("should not complain about a valid card", async () => {
        document = await parse(`
name: "Ifrit" 
id: 1
type: monster
category: fire
artwork: "https://manacards.s3.fr-par.scw.cloud/cards/ifrit.webp"
traits: spellcaster
attack: 3000
hp: 3000
stars: 10
description: "Lord of fire and destruction"
abilities:
    [active] "Annihilation":
        description: "Destroy all monsters on the field except for Ifrit"
        auto select $allCards from the battlefield where($allCards.category = fire)
        [effect] destroy $allCards
        `);
        
        const diagnostics = document.diagnostics ?? [];
        expect(diagnostics).toHaveLength(0);
    });
});

function checkDocumentValid(document: LangiumDocument): string | undefined {
    return document.parseResult.parserErrors.length && s`
        Parser errors:
          ${document.parseResult.parserErrors.map(e => e.message).join('\n  ')}
    `
        || document.parseResult.value === undefined && `ParseResult is 'undefined'.`
        || !isModel(document.parseResult.value) && `Root AST object is a ${document.parseResult.value.$type}, expected a '${Model}'.`
        || undefined;
}
