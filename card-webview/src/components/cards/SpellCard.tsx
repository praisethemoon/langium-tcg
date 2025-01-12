import React from "react";
import { isEffectStep, isSelectStep, SpellCard, VariableDecl } from "../../../../src/language/generated/ast";
import { typeIcons } from "./MonsterCard";
import { EffectStepComponent } from "./ast-renderers/EffectStepComponent";
import { SelectStepComponent } from "./ast-renderers/SelectStepComponent";

interface SpellCardProps {
    card: SpellCard;
}

export const SpellCardComponent: React.FC<SpellCardProps> = ({ card }) => {
    const variables: { [key: string]: VariableDecl | undefined } = {};
    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            <div className="w-full flex-1 overflow-y-auto px-4 py-4">
                <div className="flex flex-col items-center gap-4 w-full">
                    <div className="card-base bg-blue-200 rounded-md shrink-0">
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
                            Spell Card
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
                                <h5 className="text-sm font-bold text-gray-800">Effect:</h5>
                                {card.steps.map((step, index) => (<>
                                    <h5 className="text-sm font-bold text-gray-800 mt-2">Step #{index + 1}:</h5>
                                    {isSelectStep(step) && <SelectStepComponent key={index} step={step} variables={variables} />}
                                    {isEffectStep(step) && <EffectStepComponent key={index} step={step} variables={variables} />}
                                </>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};