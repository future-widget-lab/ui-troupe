import cuid from "cuid";
import { sendParent, spawn } from "xstate";
import { createModel } from "xstate/lib/model";

import { ITodo } from "./types";

interface ITodosContext {
  todos: Array<ITodo> | null;
  todoOperationsRefs: {};
}

interface ITodoAditionRequestEvent {
  type: "TODO_ADDITION_REQUEST";
  payload: {
    title: ITodo["title"];
  };
}

interface ITodoAddedEvent {
  type: "TODO_ADDED";
  payload: {
    todo: ITodo;
  };
}

interface ITodoDeletionRequestEvent {
  type: "TODO_DELETION_REQUEST";
  payload: {
    id: ITodo["id"];
  };
}

interface ITodoDeletedEvent {
  type: "TODO_DELETED";
  payload: {
    id: ITodo["id"];
  };
}

interface ITodoEditionRequestEvent {
  type: "TODO_EDITION_REQUESTED";
  payload: {
    id: ITodo["title"];
    title: ITodo["title"];
  };
}

interface ITodoEditedEvent {
  type: "TODO_EDITED";
  payload: {
    todo: ITodo;
  };
}

type ITodosEvent =
  | ITodoAditionRequestEvent
  | ITodoAddedEvent
  | ITodoDeletionRequestEvent
  | ITodoDeletedEvent
  | ITodoEditionRequestEvent
  | ITodoEditedEvent;

function pause(t: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, t);
  });
}

async function randomPause(min: number, max: number) {
  await pause(Math.random() * (max - min) + min);
}

interface IAddTodoMachineOptions {
  id: string;
  todoOpts: {
    title: string;
  };
}

function AddTodoMachine(opts: IAddTodoMachineOptions) {
  const { id, todoOpts } = opts;

  const model = createModel({});

  const machine = model.createMachine(
    {
      id,
      initial: "executing",
      states: {
        executing: {
          invoke: {
            id: "addTodo",
            src: "addTodo",
            onDone: {
              target: "completed",
              actions: ["notifyCompletion"]
            }
          }
        },
        completed: {
          type: "final"
        }
      }
    },
    {
      actions: {
        notifyCompletion: sendParent((_context, event) => {
          return {
            type: "TODO_ADDED",
            payload: {
              todo: (event as { type: "done.invoke.addTodo"; data: ITodo }).data
            }
          };
        })
      },
      services: {
        addTodo: async () => {
          await pause(2000);

          const todo: ITodo = {
            id: cuid(),
            title: todoOpts.title,
            createdAt: Date.now(),
            updatedAt: Date.now()
          };

          return todo;
        }
      }
    }
  );

  return machine;
}

interface IDeleteTodoMachineOptions {
  id: string;
  todoOpts: {
    id: string;
  };
}

function DeleteTodoMachine(opts: IDeleteTodoMachineOptions) {
  const { id, todoOpts } = opts;

  const model = createModel({});

  const machine = model.createMachine(
    {
      id,
      initial: "executing",
      states: {
        executing: {
          invoke: {
            id: "deleteTodo",
            src: "deleteTodo",
            onDone: {
              target: "completed",
              actions: ["notifyCompletion"]
            }
          }
        },
        completed: {
          type: "final"
        }
      }
    },
    {
      actions: {
        notifyCompletion: sendParent((_context, event) => {
          return {
            type: "TODO_DELETED",
            payload: {
              id: (
                event as {
                  type: "done.invoke.deleteTodo";
                  data: { id: ITodo["id"] };
                }
              ).data.id
            }
          };
        })
      },
      services: {
        deleteTodo: async () => {
          await randomPause(3000, 7000);

          const todoId = todoOpts.id;

          return {
            id: todoId
          };
        }
      }
    }
  );

  return machine;
}

interface IEditTodoMachineOptions {
  id: string;
  todos: Array<ITodo>;
  todoOpts: {
    id: string;
    title: string;
  };
}

function EditTodoMachine(opts: IEditTodoMachineOptions) {
  const { id, todos, todoOpts } = opts;

  const model = createModel({});

  const machine = model.createMachine(
    {
      id,
      initial: "executing",
      states: {
        executing: {
          invoke: {
            id: "editTodo",
            src: "editTodo",
            onDone: {
              target: "completed",
              actions: ["notifyCompletion"]
            }
          }
        },
        completed: {
          type: "final"
        }
      }
    },
    {
      actions: {
        notifyCompletion: sendParent((_context, event) => {
          return {
            type: "TODO_EDITED",
            payload: {
              todo: (event as { type: "done.invoke.editTodo"; data: ITodo })
                .data
            }
          };
        })
      },
      services: {
        editTodo: async (_context, event) => {
          await randomPause(2000, 3000);

          const todoId = todoOpts.id;
          const newTitle = todoOpts.title;

          const todo = todos.find((todo) => todo.id === todoId);

          return {
            ...todo,
            title: newTitle
          };
        }
      }
    }
  );

  return machine;
}

function TodosMachine() {
  const model = createModel<ITodosContext, ITodosEvent>({
    todos: null,
    todoOperationsRefs: {}
  });

  const machine = model.createMachine(
    {
      id: "todos",
      on: {
        TODO_ADDITION_REQUEST: {
          actions: ["registerAddTodoActor"]
        },
        TODO_ADDED: {
          actions: ["addTodo", "notifyTodoAddition"]
        },
        TODO_DELETION_REQUEST: {
          actions: ["registerDeleteTodoActor"]
        },
        TODO_DELETED: {
          actions: ["deleteTodo", "notifyTodoDeletion"]
        },
        TODO_EDITION_REQUESTED: {
          actions: ["registerEditTodoActor"]
        },
        TODO_EDITED: {
          actions: ["editTodo", "notifyTodoEdition"]
        }
      }
    },
    {
      actions: {
        registerAddTodoActor: model.assign({
          todoOperationsRefs: (context, event) => {
            const id = `Add-Todo-${cuid()}`;

            const actor = spawn(
              AddTodoMachine({
                id,
                todoOpts: (event as ITodoAditionRequestEvent).payload
              }),
              {
                name: id
              }
            );

            return {
              ...context.todoOperationsRefs,
              [id]: actor
            };
          }
        }),
        registerDeleteTodoActor: model.assign({
          todoOperationsRefs: (context, event) => {
            const id = `Delete-Todo-${cuid()}`;

            const actor = spawn(
              DeleteTodoMachine({
                id,
                todoOpts: (event as ITodoDeletionRequestEvent).payload
              }),
              {
                name: id
              }
            );

            return {
              ...context.todoOperationsRefs,
              [id]: actor
            };
          }
        }),
        registerEditTodoActor: model.assign({
          todoOperationsRefs: (context, event) => {
            const id = `Edit-Todo-${cuid()}`;

            const actor = spawn(
              EditTodoMachine({
                todos: context.todos,
                id,
                todoOpts: (event as ITodoEditionRequestEvent).payload
              }),
              {
                name: id
              }
            );

            return {
              ...context.todoOperationsRefs,
              [id]: actor
            };
          }
        }),
        addTodo: model.assign({
          todos: (context, event) => {
            const todo = (event as ITodoAddedEvent).payload.todo;

            const todos = context.todos || [];

            return [...todos, todo];
          }
        }),
        deleteTodo: model.assign({
          todos: (context, event) => {
            const todoId = (event as ITodoDeletedEvent).payload.id;
            const todos = context.todos;

            return todos.filter((todo) => {
              return todo.id !== todoId;
            });
          }
        }),
        editTodo: model.assign({
          todos: (context, event) => {
            const todos = context.todos;

            return todos.map((todo) => {
              if (todo.id !== (event as ITodoEditedEvent).payload.todo.id) {
                return todo;
              }

              return (event as ITodoEditedEvent).payload.todo;
            });
          }
        }),
        notifyTodoAddition: sendParent((_context, event) => {
          return {
            type: "TODO_ADDED",
            payload: {
              todo: (event as ITodoAddedEvent).payload.todo
            }
          };
        }),
        notifyTodoDeletion: sendParent((_context, event) => {
          return {
            type: "TODO_DELETED",
            payload: (event as ITodoDeletedEvent).payload
          };
        }),
        notifyTodoEdition: sendParent((_context, event) => {
          return {
            type: "TODO_EDITED",
            payload: (event as ITodoEditedEvent).payload
          };
        })
      }
    }
  );

  return machine;
}

export default TodosMachine;

export {
  ITodoAditionRequestEvent,
  ITodoDeletionRequestEvent,
  ITodoEditionRequestEvent,
  ITodoAddedEvent,
  ITodoDeletedEvent,
  ITodoEditedEvent,
  ITodosEvent,
  ITodosContext
};
