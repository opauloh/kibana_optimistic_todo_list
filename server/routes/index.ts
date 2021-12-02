import { IRouter } from '../../../../src/core/server';
import { registerTodoRoute } from './todo_route';

export function defineRoutes(router: IRouter) {
  registerTodoRoute(router);
}
