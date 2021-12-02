import './index.scss';

import { MyOptmisticTodoListPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, Kibana Platform `plugin()` initializer.
export function plugin() {
  return new MyOptmisticTodoListPlugin();
}
export { MyOptmisticTodoListPluginSetup, MyOptmisticTodoListPluginStart } from './types';
