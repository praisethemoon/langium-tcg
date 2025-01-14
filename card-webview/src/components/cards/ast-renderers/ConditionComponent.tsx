
import { Condition, VariableDecl } from "../../../../../src/language/generated/ast";
import { ExpressionComponent } from "./ExpressionComponent";

interface ConditionComponentProps {
    condition: Condition;
    variables: { [key: string]: VariableDecl | undefined };
}


export const ConditionComponent: React.FC<ConditionComponentProps> = ({ condition, variables }) => {
    return (
        <div className="font-mono text-sm bg-slate-50 rounded flex items-center flex-wrap gap-1 px-2">
            <ExpressionComponent expr={condition} idCounter={0} variables={variables} />
        </div>
    );
} 