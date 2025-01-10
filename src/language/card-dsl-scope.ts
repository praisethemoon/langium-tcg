import { AstNode, DefaultScopeProvider, LangiumCoreServices, ReferenceInfo, Scope } from "langium";
import { isAbility, isSelectStep, VariableDecl, isTrapCard, isSpellCard } from "./generated/ast.js";

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
        const vars = this.findReachableVariables(context.container);
        if (vars.length > 0) {
            return this.createScopeForNodes(vars);
        }
        return super.getScope(context);
    }


    /**
     * Finds all variables that are reachable from the given node.
     * It starts upwards in its own container, until we reach a select step.
     *   1. Add select step's variable
     *   2. Iterate over container's children, until we reach this select step
     * 
     */
    private findReachableVariables(node: AstNode | undefined): VariableDecl[] {
        let variables: VariableDecl[] = [];
        while ((node?.$container != undefined)) {
            if (isSelectStep(node)) {
                variables.push(node.variable);
            }

            const currentStepMarker = node;

            const parent = node.$container;

            // spell card uses AbilityBlock fragment, so it is kind of an ability
            if(isTrapCard(parent)) {
                if (parent.trigger.event.target) {
                    variables.push(parent.trigger.event.target);
                }
                if (parent.trigger.event.attacked) {
                    variables.push(parent.trigger.event.attacked);
                }
            }

            if(isAbility(parent) || isSpellCard(parent) || isTrapCard(parent)) {
                if(isAbility(parent)) {
                    if(parent.trigger?.event?.target) {
                        variables.push(parent.trigger.event.target);
                    }
                    if(parent.trigger?.event?.attacked) {
                        variables.push(parent.trigger.event.attacked);
                    }
                }

                for(const step of parent.steps) {
                    if(isSelectStep(step)) {
                        variables.push(step.variable);
                        if(step === currentStepMarker) {
                            break;
                        }
                    }
                }
            }

            node = parent;
        }
        return variables;
    }

}
