import { BaseCard, isMonsterCard, isSpellCard, isTrapCard } from "../../../../src/language/generated/ast";
import { MonsterCardComponent } from "./MonsterCard";
import { SpellCardComponent } from "./SpellCard";
import { TrapCardComponent } from "./TrapCard";

type CardProps = {
    card: BaseCard;
};

/**
 * Card component that renders the appropriate card type based on the card data
 */
export const Card: React.FC<CardProps> = ({ card }) => {
    return (
        <div className="overflow-y-auto">
            {isMonsterCard(card) && <MonsterCardComponent card={card} />}
            {isSpellCard(card) && <SpellCardComponent card={card} />}
            {isTrapCard(card) && <TrapCardComponent card={card} />}
        </div>
    );
};
