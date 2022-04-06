import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
    TransitionGroup,
    CSSTransition,
    SwitchTransition
} from "react-transition-group";
import './styles/animation.scss'
import { todoRouteTuple } from "./App";
import { Nav, NavItem } from "./components/Nav";
export default function Layout() {
    let navigate = useNavigate();
    let location = useLocation();

    return (
        <div className="App">
            <Nav activeTab={todoRouteTuple[0][0]}>
                {todoRouteTuple.map(routeTuple =>
                    <NavItem key={routeTuple[0]} id={routeTuple[0]} onClick={() => { navigate(routeTuple[0]) }}>{routeTuple[0]}</NavItem>
                )}
                
            </Nav>
            <Outlet />
            {/* <TransitionGroup component={null}>
                <CSSTransition key={location.key} classNames="fade" timeout={300}>
                </CSSTransition>
            </TransitionGroup> */}
        </div>
    );
}