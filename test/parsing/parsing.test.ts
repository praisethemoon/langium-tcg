import { beforeAll, describe, expect, test } from "vitest";
import { EmptyFileSystem, type LangiumDocument } from "langium";
import { expandToString as s } from "langium/generate";
import { parseHelper } from "langium/test";
import { createCardDslServices } from "../../src/language/card-dsl-module.js";
import { BinExpr, ElementCategoryConstant, Model, MonsterCard, SelectStep, isEffectStep, isElementCategoryConstant, isSelectStep } from "../../src/language/generated/ast.js";

let services: ReturnType<typeof createCardDslServices>;
let parse:    ReturnType<typeof parseHelper<Model>>;
let document: LangiumDocument<Model> | undefined;

beforeAll(async () => {
    services = createCardDslServices(EmptyFileSystem);
    parse = parseHelper<Model>(services.CardDsl);

    // activate the following if your linking test requires elements from a built-in library, for example
    // await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
});

describe('Parsing tests', () => {

    test('parse simple model', async () => {
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
        auto select $allCards from the battlefield where($allCards.category = fire)
        [effect] destroy $allCards

        `);

        // Check overall status
        expect(document.parseResult.parserErrors).toHaveLength(0);

        // make sure we have 1 card
        expect(document.parseResult.value?.cards.length).toBe(1);

        // get the first card
        const card = document.parseResult.value?.cards[0];


        expect(
            card.name
        ).toBe(s`Ifrit`);
        

        const cardType = card?.type;
        expect(cardType).toBe('monster');

        const monsterCard = card as MonsterCard;

        // make sure we have 1 ability
        expect(monsterCard.abilities.length).toBe(1);
        expect(monsterCard.abilities[0].name).toBe('Annihilation');

        // make sure we have 2 step in the ability, 1 select and 1 effect
        expect(monsterCard.abilities[0].steps.length).toBe(2);


        expect(isSelectStep(monsterCard.abilities[0].steps[0])).toBe(true);
        expect(isEffectStep(monsterCard.abilities[0].steps[1])).toBe(true);

        const selectStep = monsterCard.abilities[0].steps[0] as SelectStep;
        //expect(isBinExpr(selectStep.condition)).toBe(true);
        
        const binExpr = selectStep.condition as BinExpr;

        const rhs = binExpr.right;
        expect(isElementCategoryConstant(rhs)).toBe(true);

        const categoryConstant = rhs as ElementCategoryConstant;
        expect(categoryConstant.value).toBe('fire');
    });
});
