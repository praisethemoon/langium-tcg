import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { CardDslAstType, BaseCard } from './generated/ast.js';
import type { CardDslServices } from './card-dsl-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: CardDslServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.CardDslValidator;
    const checks: ValidationChecks<CardDslAstType> = {
        BaseCard: validator.checkPersonStartsWithCapital
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class CardDslValidator {

    checkPersonStartsWithCapital(card: BaseCard, accept: ValidationAcceptor): void {
        if (card.name) {
            const firstChar = card.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Card name should start with a capital.', { node: card, property: 'name' });
            }
        }
    }

}
