interface VarProps {
    children: React.ReactNode;
    className?: string;
}

// Var for simplicity
export const Var: React.FC<VarProps> = ({ children }) => {
    return (
        <span className="inline-block px-1 mx-0.5 py-0.5 bg-slate-100 text-slate-700 font-mono border border-slate-300 rounded-sm">
            {children}
        </span>
    );
};