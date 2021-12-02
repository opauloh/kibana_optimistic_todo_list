import { PluginInitializerContext } from '../../../src/core/server';
import { MyOptmisticTodoListPlugin } from './plugin';

//  This exports static code and TypeScript types,
//  as well as, Kibana Platform `plugin()` initializer.

export function plugin(initializerContext: PluginInitializerContext) {
  return new MyOptmisticTodoListPlugin(initializerContext);
}

export { MyOptmisticTodoListPluginSetup, MyOptmisticTodoListPluginStart } from './types';
