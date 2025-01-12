import { 
    GiAtom, 
    GiCardPick, 
    GiHearts, 
    GiHollowCat, 
    GiIdCard, 
    GiPolarStar, 
    GiSwordBrandish 
} from "react-icons/gi";

import { 
    BinExpr, 
    CardTypeConstant, 
    ElementCategoryConstant, 
    MonsterTraitConstant, 
    Variable, 
    Condition, 
    VariableDecl, 
    ElementCategory, 
    MonsterTrait, 
    isIntConstant,
    isVariableExpression,
    isThisConstant,
    isCardTypeConstant,
    isElementCategoryConstant,
    isMonsterTraitConstant
} from "../../../../../src/language/generated/ast";

import { Var } from "./VariableComponent";

import typeDark from "../../../assets/game/types/dark.png";
import typeEarth from "../../../assets/game/types/earth.png";
import typeFire from "../../../assets/game/types/fire.png";
import typeLight from "../../../assets/game/types/light.png";
import typeWater from "../../../assets/game/types/water.png";
import typeWind from "../../../assets/game/types/wind.png";

import traitBeast from "../../../assets/game/traits/beast.png";
import traitConstruct from "../../../assets/game/traits/construct.png";
import traitDemon from "../../../assets/game/traits/demon.png";
import traitDivine from "../../../assets/game/traits/divine.png";
import traitDragon from "../../../assets/game/traits/dragon.png";
import traitSpellcaster from "../../../assets/game/traits/spellcaster.png";
import traitSpirit from "../../../assets/game/traits/spirit.png";
import traitUndead from "../../../assets/game/traits/undead.png";
import traitWarrior from "../../../assets/game/traits/warrior.png";

// Define valid property types
type CardProperty = "attack" | "hp" | "stars" | "id" | "traits" | "type" | "category";

// Type the icon mapping object
const propIcon: Record<CardProperty, JSX.Element> = {
    "attack": <GiSwordBrandish size={20} style={{marginLeft: "3px"}}/>,
    "hp": <GiHearts size={20} style={{marginLeft: "3px"}}/>,
    "stars": <GiPolarStar size={20} style={{marginLeft: "3px"}}/>,
    "id": <GiIdCard size={20} style={{marginLeft: "3px"}}/>,
    "traits": <GiHollowCat size={20} style={{marginLeft: "3px"}}/>,
    "type": <GiCardPick size={20} style={{marginLeft: "3px"}}/>,
    "category": <GiAtom size={20} style={{marginLeft: "3px"}}/>
} as const;

const categoryIcons: Record<ElementCategory, JSX.Element> = {
    "dark": <img src={typeDark} alt="dark" style={{width: "20px", height: "20px"}}/>,
    "earth": <img src={typeEarth} alt="earth" style={{width: "20px", height: "20px"}}/>,
    "fire": <img src={typeFire} alt="fire" style={{width: "20px", height: "20px"}}/>,
    "light": <img src={typeLight} alt="light" style={{width: "20px", height: "20px"}}/>,
    "water": <img src={typeWater} alt="water" style={{width: "20px", height: "20px"}}/>,
    "wind": <img src={typeWind} alt="wind" style={{width: "20px", height: "20px"}}/>,
} as const;

const traitIcons: Record<MonsterTrait, JSX.Element> = {
    "beast": <img src={traitBeast} alt="beast" style={{width: "23px", height: "23px"}}/>,
    "construct": <img src={traitConstruct} alt="construct" style={{width: "23px", height: "23px"}}/>,
    "demon": <img src={traitDemon} alt="demon" style={{width: "23px", height: "23px"}}/>,
    "divine": <img src={traitDivine} alt="divine" style={{width: "23px", height: "23px"}}/>,
    "dragon": <img src={traitDragon} alt="dragon" style={{width: "23px", height: "23px"}}/>,
    "spellcaster": <img src={traitSpellcaster} alt="spellcaster" style={{width: "23px", height: "23px"}}/>,
    "spirit": <img src={traitSpirit} alt="spirit" style={{width: "23px", height: "23px"}}/>,
    "undead": <img src={traitUndead} alt="undead" style={{width: "23px", height: "23px"}}/>,
    "warrior": <img src={traitWarrior} alt="warrior" style={{width: "23px", height: "23px"}}/>,
    // TODO: Remove spectral
    "spectral": <img src={traitSpirit} alt="spectral" style={{width: "23px", height: "23px"}}/>,
} as const;

export const getVariableName = (variable: Variable, variables: { [key: string]: VariableDecl | undefined }) => {
    if ((variable as any).ref?.$ref) {
        const path = (variable as any).ref.$ref;
        const lastElement = path.split("/").pop();
        return lastElement && variables[lastElement]?.name || "?";
    }
    return variable.ref.$refText;
}

type ExpressionComponentProps = {
    expr: Condition;
    idCounter: number;
    variables: { [key: string]: VariableDecl | undefined };
}

export const ExpressionComponent: React.FC<ExpressionComponentProps> = ({ expr, idCounter, variables }) => {
    if (!expr) return null;

    // Handle binary expressions
    if ("op" in expr) {
        const binExpr = expr as BinExpr;
        return (
            <span className="font-mono text-sm bg-slate-50 rounded p-1.5 border border-slate-200 flex items-center justify-center flex-wrap gap-1">
                <ExpressionComponent expr={binExpr.left} idCounter={idCounter+1} variables={variables} />
                <span className="px-2 font-mono text-blue-600 bg-gray-300 rounded-md" id={`${idCounter}-op`}>{binExpr.op}</span>
                <ExpressionComponent expr={binExpr.right} idCounter={idCounter+1} variables={variables} />
            </span>
        );
    }

    // Handle constants and variables
    let content = "";
    let icon: JSX.Element | undefined;
    if(isIntConstant(expr)) {
        content = expr.value.rawValue.toString();
    } else if (isVariableExpression(expr)) {
        const variable = expr.value.rawValue as Variable;
        const name = getVariableName(variable, variables);
        content = name;

        if (variable.index !== undefined) {
            content += `[${variable.index}]`;
        }
        if (variable.prop) {
            content += `.${variable.prop}`;
            icon = propIcon[variable.prop as CardProperty];
        }
    }
    else if (isCardTypeConstant(expr)) {
        content = (expr as CardTypeConstant).value.rawValue;
    }
    else if (isElementCategoryConstant(expr)) {
        content = (expr as ElementCategoryConstant).value.rawValue;
        icon = categoryIcons[content as ElementCategory];
    }
    else if (isMonsterTraitConstant(expr)) {
        content = (expr as MonsterTraitConstant).value.rawValue;
        icon = traitIcons[content as MonsterTrait];
    }
    else if (isThisConstant(expr)) {
        content = "this";
    }

    return (
        <Var>
            <span className="flex flex-row items-center gap-1">{content} {icon}</span>
        </Var>
    );
};