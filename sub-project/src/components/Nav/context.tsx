import { createContext } from "react";

export type Ctx = {
    activeTab: string | null,
    setActiveTab:any
}
let defaultValue:Ctx = {
    activeTab:null,
    setActiveTab: (id:string) => id
}
export const NavContext = createContext(defaultValue);