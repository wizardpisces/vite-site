import { Outlet, useNavigate } from "react-router-dom";
import { todoRouteTuple } from "./App";
import { Nav, NavItem } from "./components/Nav";
export default function Layout() {
    let navigate = useNavigate();
    return (
        <div className="App">
            <Nav activeTab={todoRouteTuple[0][0]}>
                {todoRouteTuple.map(routeTuple =>
                    <NavItem key={routeTuple[0]} id={routeTuple[0]} onClick={() => { navigate(routeTuple[0]) }}>{routeTuple[0]}</NavItem>
                )}
            </Nav>
            <hr />
            <Outlet />
        </div>
    );
}
