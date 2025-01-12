import { SelectStep, VariableDecl } from "../../../../../src/language/generated/ast.js";
import { ConditionComponent } from "./ConditionComponent.js";
import { Var } from "./VariableComponent.js";

type SelectStepComponentProps = {
    step: SelectStep;
    variables: { [key: string]: VariableDecl | undefined };
};

const sourceToName = (source: string) => {
    if(source === "thebattlefield"){
        return "entireBattlefield";
    }
    if (source === "yourbattlefield"){
        return "playerBattlefield";
    }
    if (source === "opponentsbattlefield"){
        return "opponentBattlefield";
    }
    if (source === "yourhand"){
        return "playerHand";
    }
    if (source === "opponentshand"){
        return "opponentHand";
    }
    if (source === "yourgraveyard"){
        return "playerGraveyard";
    }
    if (source === "opponentsgraveyard"){
        return "opponentGraveyard";
    }
    if (source === "yourdeck"){
        return "playerDeck";
    }
    if (source === "opponentsdeck"){
        return "opponentDeck";
    }
    return "?";
}


export const SelectStepComponent: React.FC<SelectStepComponentProps> = ({ step, variables }) => {
    variables["variable"] = step.variable;
    const source = step.source;

    return (
        <div className="font-mono text-sm bg-green-50 rounded p-1.5 border border-slate-200 w-full flex items-center overflow-x-auto">
            <Var>
                {step.variable.name}
                {step.variable.size != null && <Var>[{step.variable.size.op}{step.variable.size.value}]</Var>}
            </Var>
            <span className="text-slate-600 px-1">=</span>
            <span className="text-purple-600">{step.auto ? "findAllCards" : "selectDialog"}</span>
            <span className="text-slate-600">(</span>
            <span className="text-slate-500">source=</span>
            <Var>{sourceToName(source)}</Var>
            {step.condition != null && (
                <span className="flex items-center">
                    <span className="text-slate-600">, </span>
                    <span className="text-slate-500">condition=</span>
                    <ConditionComponent condition={step.condition} variables={variables} />
                </span>
            )}
            <span className="text-slate-600">)</span>
        </div>
    );
};