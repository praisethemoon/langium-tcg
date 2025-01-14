import React from "react";

import spellDark from "../../assets/game/types/dark.png";
import spellEarth from "../../assets/game/types/earth.png";
import spellFire from "../../assets/game/types/fire.png";
import spellLight from "../../assets/game/types/light.png";
import spellWater from "../../assets/game/types/water.png";
import spellWind from "../../assets/game/types/wind.png";

import { isEffectStep, isSelectStep, TrapCard, VariableDecl } from "../../../../src/language/generated/ast";
import { TriggerComponent } from "./ast-renderers/TriggerComponent";
import { SelectStepComponent } from "./ast-renderers/SelectStepComponent";
import { EffectStepComponent } from "./ast-renderers/EffectStepComponent";

interface TrapCardProps {
    card: TrapCard;
}

const typeIcons: Record<string, string> = {
    dark: spellDark,
    earth: spellEarth,
    fire: spellFire,
    light: spellLight,
    water: spellWater,
    wind: spellWind,
};

/**
 * Spell Card component for displaying spell cards
 * @param props.card - Spell card data
 */
export const TrapCardComponent: React.FC<TrapCardProps> = ({ card }) => {
    const variables: { [key: string]: VariableDecl | undefined } = {};

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            <div className="w-full flex-1 overflow-y-auto px-4 py-4">
                <div className="flex flex-col items-center gap-4 w-full">
                    <div className="card-base bg-purple-200 rounded-md shrink-0">
                        <div className="card-header">
                            <h4 className="card-title">{card.name}</h4>
                            {typeIcons[card.category] && (
                                <img
                                    src={typeIcons[card.category]}
                                    alt={card.category}
                                    className="card-category"
                                    draggable={false}
                                />
                            )}
                        </div>

                        
                        <div className="retro text-md rounded-full ml-auto">
                            Trap Card
                        </div>

                        <div className="card-image-container">
                            <img
                                src={card.artwork}
                                alt={card.name}
                                className="card-image"
                                loading="lazy"
                                draggable={false}
                            />
                        </div>

                        <div className="card-description line-clamp-4">
                            {card.description}
                        </div>
                    </div>

                    <div className="w-full pb-4">
                        <h3 className="text-2xl font-bold mb-2">{card.name}:</h3>
                        <p className="mb-4">Description: {card.description}</p>
                        <div className="flex flex-col p-4 bg-white rounded-lg shadow-md border border-gray-200 mt-2">
                            <div className="flex flex-col gap-2">
                                <h5 className="text-sm font-bold text-gray-800">Trigger:</h5>
                                <TriggerComponent trigger={card.trigger.event} variables={variables} />
                                {card.steps.map((step, index) => (<div key={index}>
                                    <h5 className="text-sm font-bold text-gray-800 mt-2">Step #{index + 1}:</h5>
                                    {isSelectStep(step) && <SelectStepComponent key={index} step={step} variables={variables} />}
                                    {isEffectStep(step) && <EffectStepComponent key={index} step={step} variables={variables} />}
                                </div>)
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
