//components
import ComputeTip from "./components/ComputeTip";
import { ComputeTipProps } from "./components/ComputeTip/type";
import './index.scss'
function TodoList() {
    const tipProps: ComputeTipProps = ['(', { title: "Commission 1($)", value: "222.11" }, '-', { title: "Commission 2($)", value: "22" }, ')', 'x', { title: "Commission 3($)", value: "3%" }];
    const tipPropsWithSubTitle: ComputeTipProps = ['(', { title: ["Commission 1($)", 'this is sub title'], value: "222.11" }, '-', { title: ['Commission 2($)','this is sub title'], value: "22" }, ')', 'x', { title: 'Commission 3($)', value: "3%" }];

    const ComputeTipNode = ComputeTip(tipProps);
    const ComputeTipNodeWithSubTitle = ComputeTip(tipPropsWithSubTitle);
    return (
        <div className="demo">
            {ComputeTipNode}
            {ComputeTipNodeWithSubTitle}
        </div>
    );
}

export default TodoList;
