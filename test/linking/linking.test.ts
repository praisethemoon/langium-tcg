import { afterEach, beforeAll, describe, expect, test } from "vitest";
import { EmptyFileSystem, type LangiumDocument } from "langium";
import { expandToString as s } from "langium/generate";
import { clearDocuments, parseHelper } from "langium/test";
import { createCardDslServices } from "../../src/language/card-dsl-module.js";
import { Model, isModel } from "../../src/language/generated/ast.js";

let services: ReturnType<typeof createCardDslServices>;
let parse:    ReturnType<typeof parseHelper<Model>>;
let document: LangiumDocument<Model> | undefined;

beforeAll(async () => {
    services = createCardDslServices(EmptyFileSystem);
    parse = parseHelper<Model>(services.CardDsl);

    // activate the following if your linking test requires elements from a built-in library, for example
    // await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
});

afterEach(async () => {
    document && clearDocuments(services.shared, [ document ]);
});

describe('Linking tests', () => {

    test('linking of greetings', async () => {
        document = await parse(`
name: "Ifrit" 
id: 1
type: monster
category: fire
artwork: "https://manacards.s3.fr-par.scw.cloud/cards/ifrit.webp"
traits: spellcaster
attack: 3000
hp: 1000
stars: 10
description: "Lord of fire and destruction"
abilities:
    [active] "Annihilation":
        description: "Destroy all monsters on the field except for Ifrit"
        auto select $allCards from the battlefield where (($allCards.category = fire) and ($allCards.attack < $allCards.hp))
        [effect] destroy $allCards
        `);

        expect(
            // here we first check for validity of the parsed document object by means of the reusable function
            //  'checkDocumentValid()' to sort out (critical) typos first,
            // and then evaluate the cross references we're interested in by checking
            //  the referenced AST element as well as for a potential error message;
            checkDocumentValid(document)
                || document.parseResult.value.cards.map(g => g.name).join('\n')
        ).toBe(s`
            Ifrit
        `);
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
