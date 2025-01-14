import { Ability, AbilityStep, isEffectStep, isSelectStep, VariableDecl } from "../../../../../src/language/generated/ast";
import { EffectStepComponent } from "./EffectStepComponent.js";
import { SelectStepComponent } from "./SelectStepComponent.js";
import { TriggerComponent } from "./TriggerComponent.js";

type MonsterAbilityComponentProps = {
    ability: Ability;
};


export const AbilityComponent: React.FC<MonsterAbilityComponentProps> = ({ ability }) => {
    // an initial variable map will be 
    // populated with the variables as we traverse the ability's AST
    const initialVarMap: { [key: string]: VariableDecl | undefined } = {};

    return (
        <div className="flex flex-col p-4 bg-white rounded-lg shadow-md border border-gray-200 mt-2">
            <div className="flex items-center gap-2 mb-2">
                <h5 className="text-sm font-bold text-gray-800">{ability.name}</h5>
                <span className={`px-2 py-1 text-sm font-medium text-gray-600 ${ability.type == "passive" ? "bg-red-100" : "bg-green-100"} rounded-full`}>
                    {ability.type}
                </span>
            </div>
            {(ability.type == "passive") && (ability.trigger != null) && (
                <div className="flex flex-col border-b-2 border-b-gray-600 pb-2">
                    <h5 className="text-sm font-bold text-gray-800">Trigger Condition: </h5>
                    <TriggerComponent trigger={ability.trigger.event} variables={initialVarMap} />
                </div>
            )}
            <div className="text-gray-600 leading-relaxed">
                <h5 className="text-sm font-bold text-gray-800">Text Description:</h5>
                <div className="text-sm bg-green-50 rounded p-1.5 border border-slate-200 w-full mt-2">{ability.description}</div>
            </div>

            {/* steps */}
            <div className="flex flex-col gap-2 mt-2">
                <h5 className="text-sm font-bold text-gray-800">Ability Steps:</h5>
                {ability.steps.map((step: AbilityStep, index: number) => {
                    return (
                        <div key={index} className="text-sm rounded p-1.5 border border-slate-200 w-full mt-2">
                            <h5 className="text-sm font-bold text-gray-800 mb-2">Step #{index + 1}:</h5>
                            {isSelectStep(step) && <SelectStepComponent step={step} variables={initialVarMap} />}
                            {isEffectStep(step) && <EffectStepComponent step={step} variables={initialVarMap} />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};