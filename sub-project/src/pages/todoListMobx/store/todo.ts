import { action, makeObservable, observable } from "mobx";

let nextTodoId = 0;
export default class Todo {
  id: number;
  @observable task: string = "";
  @observable complete: boolean = false;

  constructor(txt: string) {
    makeObservable(this);
    this.task = txt;
    this.id = ++nextTodoId;
  }
  
  @action
  toggle() {
    this.complete = !this.complete;
  }
}
