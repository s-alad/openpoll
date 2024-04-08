import { useContext, createContext, useState, useEffect } from "react";

interface IGlobalContext {

}

const GlobalContext = createContext<IGlobalContext>({

});

export function useGlobal() {
    return useContext(GlobalContext);
}

export default function GlobalProvider({ children }: { children: React.ReactNode }) {
    return (
        <GlobalContext.Provider value={{ }}>
            {children}
        </GlobalContext.Provider>
    );
}