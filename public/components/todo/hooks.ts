import { CoreStart } from 'kibana/public';
import { TODO_ROUTE } from '../../../common';
import { Todo, TodoListResponse } from '../../../common/types';
import { useMutation, useQueryClient } from 'react-query';
import { useKibana } from '../../../../../src/plugins/kibana_react/public';

export const useTodoMutate = () => {
  const { http, notifications } = useKibana<CoreStart>().services;
  const queryClient = useQueryClient();

  const postAddTodo = async (newTodo: any) =>
    http.post(TODO_ROUTE, { body: JSON.stringify(newTodo) });

  const putUpdateTodo = async (todo: any) => http.put(TODO_ROUTE, { body: JSON.stringify(todo) });

  const deleteTodo = async (todo: any) => http.delete(TODO_ROUTE, { body: JSON.stringify(todo) });

  // non optimistic Add todo
  const { mutate: traditionalCreateMutate, isLoading: createIsLoading } = useMutation(postAddTodo, {
    onError: (error: any, variables) => {
      notifications.toasts.addDanger(
        `Error: ${error.message} when attempting to insert ${variables.description}`
      );
    },
    onSuccess: (res: any, variables) => {
      notifications.toasts.addSuccess(`${variables.description} was added!`);
      queryClient.invalidateQueries('todos');
    },
  });

  // Add a todo
  const { mutate: createMutate } = useMutation(postAddTodo, {
    // When mutate is called:
    onMutate: async (todo) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries('todos');

      // Build a new todo object, only the necessary fields to show in the UI
      const newTodo: Todo = {
        _id: todo.id,
        _source: {
          description: todo.description,
          completed: false,
          placeholder: true, // This is a placeholder flag, we are using to prevent mutations while not synced with the server
          timestamp: new Date().toISOString(),
        },
      };

      // Optimistically adding the new todo into the current todo list
      queryClient.setQueryData('todos', (previousData: any) => ({
        ...previousData,
        hits: [...previousData.hits, newTodo],
        total: {
          ...previousData.total,
          value: previousData.total.value + 1, // Incrementing the total count
        },
      }));
    },
    onError: (error: any, variables) => {
      // Reverting the optimistic insert, removing the todo from the current todo list
      queryClient.setQueryData('todos', (previousData: any) => ({
        ...previousData,
        hits: previousData.hits.filter((todo: any) => todo._id !== variables.id),
        total: {
          ...previousData.total,
          value: previousData.total.value - 1, // Decrementing the total count
        },
      }));

      notifications.toasts.addDanger(
        `Error: ${error.message} when attempting to insert ${variables.description}`
      );
    },
    onSuccess: (res: any) => {
      // Optimistically sync the inserted todo with the server
      queryClient.setQueryData('todos', (previousData: any) => ({
        ...previousData,
        hits: previousData.hits.map((todo: any) => {
          // Change only the updated todo from the list with information from the server
          if (todo._id === res.todo.id) {
            return {
              ...todo,
              _source: {
                ...res.todo.body,
                placeholder: false, // Removing the placeholder flag, so the users can interact with the todo
              },
            };
          }
          return todo;
        }),
      }));
    },
  });

  // Update a todo
  const { mutate: updateMutate } = useMutation(putUpdateTodo, {
    onMutate: async (updatedTodo) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries('todos');

      // // Get a snapshot of the updated Todo
      const snapshot = queryClient
        .getQueryData<TodoListResponse>('todos')
        ?.hits?.find((todo) => todo._id === updatedTodo.id);

      // Optimistically update to the new value
      queryClient.setQueryData('todos', (previousData: any) => ({
        ...previousData,
        hits: previousData.hits.map((todo: any) => {
          // Change only the updated todo from the list
          if (todo._id === updatedTodo.id) {
            return {
              ...todo,
              _source: {
                ...todo._source,
                completed: updatedTodo.completed,
              },
            };
          }
          return todo;
        }),
      }));

      // Return a snapshot so we can rollback in case of failure
      return snapshot;
    },
    onError: (error: any, variables, snapshot) => {
      // Reverting the optimistic update from the current todo list
      queryClient.setQueryData('todos', (previousData: any) => ({
        ...previousData,
        hits: previousData.hits.map((todo: any) => {
          // Change only the updated todo from the list
          if (todo._id === (snapshot as Todo)._id) {
            return {
              ...todo,
              _source: {
                ...todo._source,
                completed: (snapshot as Todo)._source.completed,
              },
            };
          }
          return todo;
        }),
      }));

      notifications.toasts.addDanger(
        `Error: ${error.message} when attempting to mark ${
          (snapshot as Todo)._source.description
        } as ${variables.completed ? 'Completed' : 'Uncompleted'}, reverting to ${
          variables.completed ? 'Uncompleted' : 'Completed'
        }`
      );
    },
  });

  // Delete a todo
  const { mutate: deleteMutate } = useMutation(deleteTodo, {
    onMutate: async (deletedTodo) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries('todos');

      // // Get a snapshot of deleted Todo
      const snapshot = queryClient
        .getQueryData<TodoListResponse>('todos')
        ?.hits?.find((todo) => todo._id === deletedTodo.id);

      // // Optimistically update to the new value
      queryClient.setQueryData('todos', (previousData: any) => ({
        ...previousData,
        hits: previousData.hits.filter((todo: any) => todo._id !== deletedTodo.id),
        total: {
          ...previousData.total,
          value: previousData.total.value - 1,
        },
      }));

      return snapshot;
    },
    onError: (error: any, variables, snapshot) => {
      // Reverting the optimistic delete, adding the todo again into the current todo list
      queryClient.setQueryData('todos', (previousData: any) => ({
        ...previousData,
        hits: [...previousData.hits, snapshot],
        total: {
          ...previousData.total,
          value: previousData.total.value + 1, // Incrementing the total count
        },
      }));

      notifications.toasts.addDanger(
        `Error: ${error.message} when attempting to remove ${
          (snapshot as Todo)._source.description
        }, please try again.`
      );
    },
  });

  return {
    createMutate,
    traditionalCreateMutate,
    createIsLoading,
    updateMutate,
    deleteMutate,
  };
};
