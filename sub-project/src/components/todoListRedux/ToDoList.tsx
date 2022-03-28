import { connect } from "react-redux";
import ToDo from "./ToDo";
import { completeTodo } from "./actions";
import { Todo } from "./store";

const ToDoList = ({ state, clearCompleted }) => {
  return (
    <div>
      {state.map((todo: Todo) => {
        return <ToDo key={todo.id} todo={todo} />;
      })}
      <button style={{ margin: "20px" }} onClick={clearCompleted}>
        Clear Completed
      </button>
    </div>
  );
};

const mapStateToProps = (state) => ({
  state: state.todoList,
});

const mapDispatchToProps = (dispatch) => ({
  clearCompleted: () => dispatch(completeTodo()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ToDoList);
