import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { BaseCard, CardDslAstType, MonsterCard } from './generated/ast.js';
import type { CardDslServices } from './card-dsl-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: CardDslServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.CardDslValidator;
    const checks: ValidationChecks<CardDslAstType> = {
        MonsterCard: [
            validator.checkMonsterStars, 
            validator.checkMonsterTrait, 
            validator.checkMonsterAttack, 
            validator.checkMonsterHealth
        ],
        BaseCard: [
            validator.checkBaseCardLimit
        ]
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class CardDslValidator {

    checkMonsterStars(card: MonsterCard, accept: ValidationAcceptor): void {
        if (card.stars < 1 || card.stars > 10) {
            accept('error', 'Monster stars must be between 1 and 10.', { node: card, property: 'stars' });
        }
    }

    checkMonsterTrait(card: MonsterCard, accept: ValidationAcceptor): void {
        if (card.traits.length === 0) {
            accept('error', 'Monster must have at least one trait.', { node: card, property: 'traits' });
        }

        if (card.traits.length > 3) {
            accept('error', 'Monster cannot have more than 3 traits.', { node: card, property: 'traits' });
        }
    }

    checkMonsterAttack(card: MonsterCard, accept: ValidationAcceptor): void {
        if (card.attack < 0) {
            accept('error', 'Monster attack cannot be negative.', { node: card, property: 'attack' });
        }

        if (card.attack > 10000) {
            accept('error', 'Monster too powerful. Heard about game balance?', { node: card, property: 'attack' });
        }
    }

    checkMonsterHealth(card: MonsterCard, accept: ValidationAcceptor): void {
        if (card.health <= 0) {
            accept('error', 'Monster health must be greater than 0.', { node: card, property: 'health' });
        }

        if (card.health > 10000) {
            accept('error', 'Monster too tanky. Heard about game balance?', { node: card, property: 'health' });
        }
    }

    checkBaseCardLimit(card: BaseCard, accept: ValidationAcceptor): void {
        if ((card.limit != undefined) && card.limit <= 0) {
            accept('error', 'Card limit must be either omitted or greater than 0.', { node: card, property: 'limit' });
        }
    }
}
