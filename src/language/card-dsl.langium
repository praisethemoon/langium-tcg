grammar CardDsl

// Entry point for the grammar
entry Model:
    (cards+=Card)*;

interface BaseCard {
    name: string;
    id: number;
    type: string;
    category: string;
    artwork: string;
    limit?: number;
}

// Main card types
Card returns BaseCard:
    CommonHeader
    (
        MonsterCard |
        SpellCard |
        TrapCard
    );

// Common header for all cards
CommonHeader:
    'name' ':' name=STRING
    'id' ':' id=INT
    'type' ':' type=CardType
    'category' ':' category=ElementCategory
    'artwork' ':' artwork=STRING
    ('limit' ':' limit=INT)?;

// Card type definition
CardType returns string:
    'monster' | 'spell' | 'trap';

// Element categories
ElementCategory returns string:
    'dark' | 'light' | 'fire' | 'water' | 'earth' | 'wind';

MonsterTrait returns string:
    'spellcaster' | 'beast' | 'construct' | 'demon' | 'divine' | 'dragon' | 'spectral' | 'spirit' | 'undead' | 'warrior';

// Monster card specific fields
MonsterCard:
    'traits' ':' traits+=MonsterTrait (',' traits+=MonsterTrait)*
    'attack' ':' attack=INT
    'hp' ':' health=INT
    'stars' ':' stars=INT
    'description' ':' description=STRING
    ('abilities' ':'  INDENT abilities+=Ability* DEDENT)?;

// Spell card specific fields
SpellCard:
    'description' ':' description=STRING
    'spell' ':' INDENT AbilityBlock<false> DEDENT;

// Trap card specific fields
TrapCard:
    'description' ':' description=STRING
    'trigger' ':' trigger=TriggerCondition
    'effect' ':' INDENT AbilityBlock<false> DEDENT;

// Ability definition
Ability:
    '[' AbilityType ']' name=STRING ':' INDENT AbilityBlock<true> DEDENT;

fragment AbilityType:
    type='active' | (type='passive' ',' trigger=TriggerCondition);

// Ability block containing steps
fragment AbilityBlock<allowDescription>:
    (<allowDescription>AbilityDescription)? steps+=AbilityStep+;

fragment AbilityDescription:
    'description' ':' description=STRING;

// Individual ability steps
AbilityStep:
    (SelectStep | EffectStep);

// Select statement
SelectStep:
    (auto?='auto')? 'select' variable=VariableDecl<true> 'from' source=SelectSource ('where' condition=Condition)?;

// Effect statement
EffectStep:
    '[effect]' effect=Effect;

// Variable definition (starts with $), and might contain 
// a predefined size or size limit
VariableDecl<allowArray>: '$' name=ID (<allowArray>('[' size=ArraySize ']'))?;

/**
 * Despite $card[0] being an expression, for simplicity, we
 * will treat it as a variable. as our DSL doesn't support
 * iteration over arrays. It is going to be used for cases
 * where the array size is fixed.
 */
Variable: '$' ref=[VariableDecl:ID]('[' index=INT ']')? ('.' prop=("attack" | "hp" | "stars" | "traits" | "id" | "type" | "category"))?;

// Array size constraints
ArraySize:
    op=('='|'<'|'>') value=INT;

// Effect types
Effect:
    // Effects related to attacking / other effects
    action='cancel' 'effect' |
    action='cancel' 'attack' |
    action='change' 'target' target=Variable 'to' newTarget=Variable |

    // Monster effects
    action='increase' stat=('attack' | 'hp') 'of' target=Variable 'by' amount=Expr |
    action='weaken' stat=('attack' | 'hp') 'of' target=Variable 'by' amount=Expr |
    action='summon' target=Variable |
    action='destroy' target=Variable |
    
    // Player effects
    action='heal' 'for' amount=Expr |
    
    (isOpponent?=('opponent'))? action='gain' 'life' 'equal' 'to' amount=Expr |
    (isOpponent?=('opponent'))? action='loose' 'life' 'equal' 'to' amount=Expr |
    (isOpponent?=('opponent'))? action=('draw' | 'discard') amount=INT 'cards';


// Trigger conditions
TriggerCondition:
    'trigger' 'on' event=TriggerEvent;

TriggerEvent:
    (isOpponent=('opponent'))? trigger='summon' target=VariableDecl<false> ('where' condition=Condition)? | 
    (isOpponent=('opponent'))? trigger='death' target=VariableDecl<false> ('where' condition=Condition)? | 
    (isOpponent=('opponent'))? trigger='attack' target=VariableDecl<false> 'attacking' attacked=VariableDecl<false> ('where' condition=Condition)? | 
    (isOpponent=('opponent'))? trigger='damaged' target=VariableDecl<false> ('where' condition=Condition)? |
    (isOpponent=('opponent'))? trigger='healed' target=VariableDecl<false> ('where' condition=Condition)? |
    (isOpponent=('opponent'))? trigger='draw' |
    (isOpponent=('opponent'))? trigger='discard' |
    (isOpponent=('opponent'))? trigger='activate' activatedEntity=("trap"|"spell"|"ability") ('where' condition=Condition)?;

// Expression hierarchy
Expr: OrExpr;

OrExpr infers Expr:
    AndExpr ({infer BinExpr.left=current} op='or' right=AndExpr)*;

AndExpr infers Expr:
    CompExpr ({infer BinExpr.left=current} op='and' right=CompExpr)*;

CompExpr infers Expr:
    AddExpr ({infer BinExpr.left=current} op=('=' | '!=' | '<' | '>' | '<=' | '>=') right=AddExpr)*;

AddExpr infers Expr:
    MultExpr ({infer BinExpr.left=current} op=('+'|'-') right=MultExpr)*;

MultExpr infers Expr:
    PrimExpr ({infer BinExpr.left=current} op=('*'|'/') right=PrimExpr)*;

PrimExpr infers Expr:
    INT ({infer IntConstant.value=current}) | 
    ElementCategory ({infer ElementCategoryConstant.value=current}) |
    CardType ({infer CardTypeConstant.value=current}) |
    MonsterTrait ({infer MonsterTraitConstant.value=current}) |
    Variable ({infer Variable.value=current}) | 
    "this" ({infer ThisConstant.value=current}) |
    '(' Expr ')';

// Conditions for where clauses
Condition: Expr;

SelectSource returns string:
    // Battlefield
    'the' 'battlefield' |
    'your' 'battlefield' |
    'opponents' 'battlefield' |

    // Hand
    'your' 'hand' |
    'opponents' 'hand' |

    // Deck
    'your' 'deck' |
    'opponents' 'deck' | 

    // Graveyard
    'your' 'graveyard' |
    'opponents' 'graveyard' |
    
    // Coin flip, either true or false, i.e matches what the player rolled
    'coin' 'flip';


// Indentation handling
terminal INDENT: 'synthetic:indent';
terminal DEDENT: 'synthetic:dedent';
hidden terminal WS: /[\t ]+/;
hidden terminal NL: /[\r\n]+/;

// Other terminal rules
terminal ID: /[_a-zA-Z][\w_-]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*|#[^\n\r]*/;
