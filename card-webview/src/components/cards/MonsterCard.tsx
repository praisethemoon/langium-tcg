import React from "react";
import { GiPolarStar, GiSwordBrandish, GiHearts } from "react-icons/gi";

import typeDark from "../../assets/game/types/dark.png";
import typeEarth from "../../assets/game/types/earth.png";
import typeFire from "../../assets/game/types/fire.png";
import typeLight from "../../assets/game/types/light.png";
import typeWater from "../../assets/game/types/water.png";
import typeWind from "../../assets/game/types/wind.png";

import traitBeast from "../../assets/game/traits/beast.png";
import traitConstruct from "../../assets/game/traits/construct.png";
import traitDemon from "../../assets/game/traits/demon.png";
import traitDivine from "../../assets/game/traits/divine.png";
import traitDragon from "../../assets/game/traits/dragon.png";
import traitSpellcaster from "../../assets/game/traits/spellcaster.png";
import traitSpirit from "../../assets/game/traits/spirit.png";
import traitUndead from "../../assets/game/traits/undead.png";
import traitWarrior from "../../assets/game/traits/warrior.png";
import { MonsterCard } from "../../../../src/language/generated/ast";
import { AbilityComponent } from "./ast-renderers/AbilityComponent";

interface MonsterCardProps {
    card: MonsterCard;
}

export const typeIcons: Record<string, string> = {
    dark: typeDark,
    earth: typeEarth,
    fire: typeFire,
    light: typeLight,
    water: typeWater,
    wind: typeWind,
};

export const traitIcons: Record<string, string> = {
    beast: traitBeast,
    construct: traitConstruct,
    demon: traitDemon,
    divine: traitDivine,
    dragon: traitDragon,
    spellcaster: traitSpellcaster,
    spirit: traitSpirit,
    undead: traitUndead,
    warrior: traitWarrior,
};

/**
 * Monster Card component for displaying creature cards
 * @param props.card - Monster card data
 */
export const MonsterCardComponent: React.FC<MonsterCardProps> = ({ card }) => {
    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            <div className="w-full flex-1 overflow-y-auto px-4 py-4">
                <div className="flex flex-col items-center gap-4 w-full">
                    <div className="card-base bg-red-200 rounded-md shrink-0">
                        <div className="card-header">
                            <h4 className="card-title">{card.name}</h4>
                            {card.traits.map((trait, index) => (
                                <div key={index} className="card-trait-container">
                                    {traitIcons[trait.toLowerCase()] && (
                                        <img
                                            src={traitIcons[trait.toLowerCase()]}
                                            alt={trait}
                                            className="card-trait"
                                            draggable={false}
                                        />
                                    )}
                                </div>
                            ))}
                            {typeIcons[card.category] && (
                                <img
                                    src={typeIcons[card.category]}
                                    alt={card.category}
                                    className="card-category"
                                    draggable={false}
                                />
                            )}
                        </div>

                        <div className="card-stars">
                            {Array.from({ length: card.stars }).map((_, index) => (
                                <GiPolarStar
                                    key={index}
                                    size={18}
                                />
                            ))}
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

                        <div className="card-description">
                            {card.description}
                        </div>

                        <div className="card-stats">
                            <div className="py-1 font-bold flex items-center justify-center">
                                <GiSwordBrandish size={18} /> {card.attack}
                            </div>
                            <div className="py-1 font-bold flex items-center justify-center">
                                {card.health}<GiHearts size={18} />
                            </div>
                        </div>
                    </div>

                    <div className="w-full pb-4">
                        <h3 className="text-2xl font-bold mb-2">{card.name}:</h3>
                        <p className="mb-4">Description: {card.description}</p>
                        <div className="flex flex-col gap-2">
                            {card.abilities.map((ability, index) => (
                                <AbilityComponent key={index} ability={ability} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};