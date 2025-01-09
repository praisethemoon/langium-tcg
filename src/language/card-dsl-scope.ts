import { AstNode, DefaultScopeProvider, LangiumCoreServices, ReferenceInfo, Scope } from "langium";
import { Ability,  isAbility, isSelectStep, SelectStep, VariableDecl, isTrapCard, TrapCard, isSpellCard, SpellCard } from "./generated/ast.js";

export class CardDslScopeProvider extends DefaultScopeProvider {
    constructor(services: LangiumCoreServices) {
        super(services);
    }

    override getScope(context: ReferenceInfo): Scope {
        const referenceType = context.property;

        // We only handle variable references
        if (referenceType !== "ref") {
            return super.getScope(context);
        }

        // Special case: handle variables used in their own where clause
        const selectStep = this.findContainingSelectStep(context.container);
        if (selectStep) {
            const declarations = this.getScopeForSelectStep(context.container, selectStep);
            if (declarations.length > 0) {
                return this.createScopeForNodes(declarations);
            }
        }

        // Get the containing ability
        const ability = this.findContainingAbility(context.container);
        if(ability) {
            // Get all variables declared in this ability
            const declarations = this.getAllVariableDeclarationsInAbility(ability);
            return this.createScopeForNodes(declarations);
        }

        // check if we have a trigger block
        const trapCard = this.findContainingTrapCard(context.container);
        if(trapCard) {
            // Get all variables declared in this ability
            const declarations = this.getAllVariableDeclarationsInTrapCard(trapCard);
            return this.createScopeForNodes(declarations);
        }

        const spellCard = this.findContainingSpellCard(context.container);
        if(spellCard) {
            // Get all variables declared in this ability
            const declarations = this.getAllVariableDeclarationsInSpellCard(spellCard);
            return this.createScopeForNodes(declarations);
        }
        return super.getScope(context);
    }


    private findContainingTrapCard(node: AstNode | undefined): TrapCard | undefined {
        while (node) {
            if (isTrapCard(node)) {
                return node;
            }
            node = node.$container;
        }
        return undefined;
    }

    private findContainingSelectStep(node: AstNode | undefined): SelectStep | undefined {
        while (node) {
            if (isSelectStep(node)) {
                return node;
            }
            node = node.$container;
        }
        return undefined;
    }

    private getScopeForSelectStep(currentNode: AstNode, selectStep: SelectStep): VariableDecl[] {
        // If we're in a where clause and the variable reference is using array indexing
        // we should allow access to the variable being declared
        if (selectStep.condition && this.isNodeContainedIn(currentNode, selectStep.condition)) {
            return [selectStep.variable];
        }
        return [];
    }

    private findContainingAbility(node: AstNode | undefined): Ability | undefined {
        while (node) {
            if (isAbility(node)) {
                return node;
            }
            node = node.$container;
        }
        return undefined;
    }

    private getAllVariableDeclarationsInAbility(ability: Ability): VariableDecl[] {
        const declarations: VariableDecl[] = [];
        const steps = ability.steps ?? [];

        for (const step of steps) {
            if (isSelectStep(step)) {
                declarations.push(step.variable);
            }
        }

        return declarations;
    }

    private getAllVariableDeclarationsInTrapCard(trapCard: TrapCard): VariableDecl[] {
        const declarations: VariableDecl[] = [];
        if(trapCard.trigger.event.target) {
            declarations.push(trapCard.trigger.event.target);
        }
        if(trapCard.trigger.event.attacked) {
            declarations.push(trapCard.trigger.event.attacked);
        }
        return declarations;
    }

    private findContainingSpellCard(node: AstNode | undefined): SpellCard | undefined {
        while (node) {
            if (isSpellCard(node)) {
                return node;
            }
            node = node.$container;
        }
        return undefined;
    }

    private getAllVariableDeclarationsInSpellCard(spellCard: SpellCard): VariableDecl[] {
        const declarations: VariableDecl[] = [];
        for (const step of spellCard.steps) {
            if (isSelectStep(step)) {
                declarations.push(step.variable);
            }
        }
        return declarations;
    }

    private isNodeContainedIn(node: AstNode, container: AstNode): boolean {
        while (node && node !== container) {
            node = node.$container!;
        }
        return node === container;
    }
}
