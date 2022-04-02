import { useContext } from "react"
import { NavContext } from "./context"
import clsx from 'clsx';

type NavItemProps = {
    children: React.ReactNode;
    id: string;
    onClick?: Function
}
export default function NavItem(props: NavItemProps) {
    let { activeTab, setActiveTab } = useContext(NavContext);
    let { onClick } = props
    function handleOnClick() {
        setActiveTab(props.id);
        onClick && onClick()
    }
    return (
        <div className={clsx("nav-item", { active: activeTab === props.id })} onClick={() => handleOnClick()}>
            {props.children}
        </div>
    )
}