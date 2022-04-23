import { useState } from "react"
import { NavContext } from "./context"
import { Ctx } from './context'
type NavProps = {
    children: React.ReactNode;
    activeTab: string
}
export default function Nav(props: NavProps) {
    let [activeTab,setActiveTab] = useState(props.activeTab)
    let ctx: Ctx = {
        activeTab,
        setActiveTab
    }

    return (
        <NavContext.Provider value={ctx}>
            <nav className="nav">{props.children}</nav>
        </NavContext.Provider>
    )
}