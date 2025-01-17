import { ValidationAcceptor } from "langium";
import { 
    Expr, 
    isBinExpr, 
    isCardTypeConstant, 
    isElementCategoryConstant, 
    isIntConstant, 
    isMonsterTraitConstant, 
    isThisConstant, 
    isVariableExpression, 
    Variable
} from "../generated/ast.js";


type ExpressionType = 'trait' | 'card_type' | 'element_category' | 'number' | "card_obj" | "boolean" | undefined;

function getVariableType(variable: Variable): ExpressionType {
    switch(variable.prop) {
        case 'type':
            return 'card_type';
        case 'traits':
            return 'trait';
        case 'category':
            return 'element_category';
        case 'attack':
        case 'hp':
        case 'id':
        case 'stars':
            return 'number';
        default:
            // when no property is specified, it is a card object
            return 'card_obj';
    }
}

export function checkExpression(expression: Expr, accept: ValidationAcceptor): ExpressionType {
    /**
     * When there are syntax errors, the expression can be undefined
     */
    if(expression === undefined) {
        return undefined;
    }

    if(isBinExpr(expression)) {
        const lhsType = checkExpression(expression.left, accept);
        const rhsType = checkExpression(expression.right, accept);

        if(expression.op === '=' || expression.op === '!=') {
            if(lhsType != rhsType) {
                accept('error', `LHS and RHS of expression must be of the same type. LHS: ${lhsType}, RHS: ${rhsType}`, { node: expression, property: 'left' });
                return undefined;
            }
            return "boolean"
        }

        if(['and', 'or'].includes(expression.op.toLowerCase())) {
            if(lhsType != 'boolean' || rhsType != 'boolean') {
                accept('error', `LHS and RHS of expression must be boolean when using AND or OR. LHS: ${lhsType}, RHS: ${rhsType}`, { node: expression, property: 'left' });
                return undefined;
            }
            return "boolean"
        }

        // any other operation must be between numbers
        if(lhsType != 'number' || rhsType != 'number') {
            accept('error', `Cannot compare non-numeric values. LHS: ${lhsType}, RHS: ${rhsType}`, { node: expression, property: 'left' });
            return undefined;
        }

        if(['+', '-', '*', '/'].includes(expression.op)) {
            return "number"
        }

        return "boolean"
    }

    if(isIntConstant(expression)) {
        return 'number'
    }

    if(isCardTypeConstant(expression)) {
        return 'card_type'
    }

    if(isElementCategoryConstant(expression)) {
        return 'element_category'
    }

    if(isMonsterTraitConstant(expression)) {
        return 'trait'
    }

    if(isVariableExpression(expression)) {
        return getVariableType(expression.value.rawValue)
    }

    if(isThisConstant(expression)) {
        return 'card_obj'
    }

    return undefined;
}