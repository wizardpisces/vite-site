import { action, computed, makeObservable, observable } from "mobx";
import { Todo } from ".";
import { create, persist } from 'mobx-persist'
export default class TodoList {
  @persist('list')
  @observable 
  list: Todo[] = [];
  constructor(todos: string[]) {
    makeObservable(this);
    todos.forEach((text)=>this.addTask(text));
  }

  @action
  addTask(text: string) {
    this.list.push(new Todo(text));
  }

  @action
  clearCompleted() {
    this.list = this.list.filter((todo) => !todo.complete);
  }

  @computed
  get completed(): Todo[] {
    return this.list.filter((todo) => todo.complete);
  }
}
