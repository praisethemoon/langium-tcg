import { TriggerEvent, VariableDecl } from "../../../../../src/language/generated/ast";
import { ConditionComponent } from "./ConditionComponent";
import { Var } from "./VariableComponent";

type TriggerComponentProps = {
    trigger: TriggerEvent;
    variables: { [key: string]: VariableDecl | undefined };
};

const getTriggerText = (trigger?: TriggerEvent) => {
    if(!trigger) return "??";

    let triggerCommand = ""
    switch (trigger.trigger) {
        case "summon":
            triggerCommand = "Summon";
            break;
        case "death":
            triggerCommand = "Death";
            break;
        case "attack":
            triggerCommand = "Attack";
            break;
        case "healed":
            triggerCommand = "Healed";
            break;
        case "draw":
            triggerCommand = "DrawCard";
            break;
        case "discard":
            triggerCommand = "DiscardCard";
            break;
        case "activate":
            triggerCommand = "ActivateEffect";
            break;
    }

    if(trigger.isOpponent){
        return "onOpponent" + triggerCommand;
    }

    return "on" + triggerCommand;
};


const triggerView = (trigger: TriggerEvent | undefined, variables: { [key: string]: VariableDecl | undefined }) => {
    const triggerText = getTriggerText(trigger);
    
    // on summon, death, attack, damaged, healed, they all require a target
    if (trigger?.target != null) {
        variables["target"] = trigger.target;

        if(trigger?.attacked != null){
            variables["attacked"] = trigger.attacked;
        }

        return (
            <>
                <div className="font-mono text-sm bg-slate-50 rounded p-1.5 border border-slate-200 w-full p-1">
                    <span className="text-purple-600">{triggerText}</span>
                    <span className="text-slate-600">(</span>
                    <span className="text-slate-500">eventSource=</span>
                    <Var>{trigger.target.name}</Var>
                    {trigger.attacked != null && (
                        <>
                            <span className="text-slate-500">, </span>
                            <span className="text-slate-500">attacked=</span>
                            <Var>{trigger.attacked.name}</Var>
                        </>
                    )}
                    <span className="text-slate-600">)</span>
                </div>
            </>
        );
    }

    // on activate, requires an effect source
    if(trigger?.activatedEntity != null){
        return (
            <p className="font-mono text-sm bg-slate-50 rounded p-1.5 border border-slate-200 w-full p-1">
                <span className="text-purple-600">{triggerText}</span>
                <span className="text-slate-600">(</span>
                <span className="text-slate-500">effectSource=</span>
                <Var className="bg-red-50">{trigger!.activatedEntity}</Var>
                <span className="text-slate-600">)</span>
            </p>
        );
    }

    return <p className="font-mono text-sm text-purple-600">{triggerText}()</p>;
};

export const TriggerComponent: React.FC<TriggerComponentProps> = ({ trigger, variables }) => {
    if(!trigger) return <p className="font-mono text-sm text-purple-600">??</p>;

    return (
        <div className="font-mono text-sm bg-slate-50 rounded p-1.5 border border-slate-200 w-full mt-2">
            {triggerView(trigger, variables)}
            {trigger.condition != null && (
                <div className="flex flex-col gap-2 mt-4">
                    <div className="text-slate-500">Extra Conditions</div>
                    <ConditionComponent condition={trigger.condition} variables={variables} />
                </div>
            )}
        </div>
    )
};