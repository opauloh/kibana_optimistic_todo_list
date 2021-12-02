import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';

export interface MyOptmisticTodoListPluginSetup {
  getGreeting: () => string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MyOptmisticTodoListPluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
}
