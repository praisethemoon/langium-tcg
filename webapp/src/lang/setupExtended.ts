import { MonacoEditorLanguageClientWrapper, UserConfig } from 'monaco-editor-wrapper';
import { configureWorker, defineUserServices } from './setupCommon.js';

export const setupConfigExtended = (): UserConfig => {
    const extensionFilesOrContents = new Map();
    extensionFilesOrContents.set('/language-configuration.json', new URL('../../../language-configuration.json', import.meta.url));
    extensionFilesOrContents.set('/card-dsl-grammar.json', new URL('../../../syntaxes/card-dsl.tmLanguage.json', import.meta.url));

    return {
        wrapperConfig: {
            serviceConfig: defineUserServices(),
            editorAppConfig: {
                $type: 'extended',
                languageId: 'card-dsl',
                code: `
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
        [effect] loose life equal to 500
        [effect] opponent loose life equal to 500
        [effect] opponent gain life equal to 500
        [effect] draw 3 cards
        [effect] discard 4 cards
    
    [passive, trigger on death $m] "What":
        description: "Does something cool"

        select $card from the battlefield where ($card.type = monster) and ($card.traits = beast)
        [effect] increase attack of $card by 500

    [active] "Compassion":
        description: "Heals all monsters on the field for 1000 life"
        auto select $allCards from the battlefield
        [effect] increase hp of $allCards by 1000

    // This card cannot attack.
    [passive, trigger on attack $m1 attacking $m2] "Peace": // TODO: Fix this
        description: "Bodhisattva disobeys your attack commands"
        [effect] cancel attack
    [active] "Raise Skeleton":
        description: "Sacrifice 500 life to summon a skeleton"
        [effect] loose life equal to 500
        select $card from the battlefield where ($card.id = 2)
        [effect] summon $card
                `,
                useDiffEditor: false,
                extensions: [{
                    config: {
                        name: 'card-dsl-web',
                        publisher: 'generator-langium',
                        version: '1.0.0',
                        engines: {
                            vscode: '*'
                        },
                        contributes: {
                            languages: [{
                                id: 'card-dsl',
                                extensions: [
                                    '.card-dsl'
                                ],
                                configuration: './language-configuration.json'
                            }],
                            grammars: [{
                                language: 'card-dsl',
                                scopeName: 'source.card-dsl',
                                path: './card-dsl-grammar.json'
                            }]
                        }
                    },
                    filesOrContents: extensionFilesOrContents,
                }],                
                userConfiguration: {
                    json: JSON.stringify({
                        'workbench.colorTheme': 'Default Dark Modern',
                        'editor.semanticHighlighting.enabled': true
                    })
                }
            }
        },
        languageClientConfig: configureWorker()
    };
};

export const executeExtended = async (htmlElement: HTMLElement) => {
    const userConfig = setupConfigExtended();
    const wrapper = new MonacoEditorLanguageClientWrapper();
    await wrapper.initAndStart(userConfig, htmlElement);
};
