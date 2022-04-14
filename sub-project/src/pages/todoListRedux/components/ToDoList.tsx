import { connect,ConnectedProps } from "react-redux";
import { useSelector, useDispatch } from "react-redux";
import ToDo from "./ToDo";
import { completeTodo, Todo } from "../store-v2/reducers/todoListSlice";
import { AppState } from "../store-v2";

// type PropsFromRedux = ConnectedProps<typeof connector>;

// const ToDoList = ({ state, clearCompleted }: PropsFromRedux) => {
const ToDoList = () => {
  const state = useSelector((state:AppState) => state.todoListSlice);
  const dispatch = useDispatch()
  return (
    <div>
      {state.map((todo: Todo) => {
        return <ToDo key={todo.id} todo={todo} />;
      })}
      <button style={{ margin: "20px" }} onClick={()=>dispatch(completeTodo())}>
        Clear Completed
      </button>
    </div>
  );
};

// const mapStateToProps = (state) => ({
//   state: state.todoList,
// });

// const mapDispatchToProps = (dispatch) => ({
//   clearCompleted: () => dispatch(completeTodo()),
// });

// const connector = connect(mapStateToProps, mapDispatchToProps);

// export default connector(ToDoList);

export default connect()(ToDoList)
