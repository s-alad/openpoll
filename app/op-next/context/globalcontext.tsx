import { useContext, createContext, useState, useEffect } from "react";

interface IGlobalContext {
    path: string;
    setPath: (path: string) => void;
}

const GlobalContext = createContext<IGlobalContext>({
    path: "",
    setPath: () => { },
});

export function useGlobal() {
    return useContext(GlobalContext);
}

export default function GlobalProvider({ children }: { children: React.ReactNode }) {
    const [path, setPath] = useState<string>("");
    return (
        <GlobalContext.Provider value={{ path, setPath }}>
            {children}
        </GlobalContext.Provider>
    );
}