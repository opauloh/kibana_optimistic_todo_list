import React, { useState } from 'react';
import { I18nProvider } from '@kbn/i18n/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import {
  EuiIcon,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageHeader,
  EuiTitle,
} from '@elastic/eui';

import { CoreStart } from '../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';

import { PLUGIN_ID } from '../../common';
import { ListTodo } from './todo/list_todo';
import { AddTodo } from './todo/add_todo';
import { KibanaContextProvider } from '../../../../src/plugins/kibana_react/public';
import { TraditionalAddTodo } from './todo/non_optimistic_add_todo';

interface KibanaOptimisticTodoListAppDeps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
}

// Initializing react-query
const queryClient = new QueryClient();

export const KibanaOptimisticTodoListApp = ({
  basename,
  notifications,
  http,
  navigation,
}: KibanaOptimisticTodoListAppDeps) => {
  const services = {
    http,
    notifications,
  };

  const [optimistic, setOptimistic] = useState(true);
  return (
    <KibanaContextProvider services={services}>
      <QueryClientProvider client={queryClient}>
        <Router basename={basename}>
          <I18nProvider>
            <>
              <navigation.ui.TopNavMenu
                appName={PLUGIN_ID}
                showSearchBar={false}
                useDefaultBehaviors={true}
              />
              <EuiPage restrictWidth="1000px">
                <EuiPageBody>
                  <EuiPageHeader>
                    <EuiTitle size="l">
                      <h1
                        css={`
                          width: 100%;
                        `}
                      >
                        My {optimistic ? 'Optimistic ' : ''}Todo List{' '}
                        <EuiIcon
                          type="merge"
                          size="l"
                          color="primary"
                          css={`
                            float: right;
                            cursor: pointer;
                          `}
                          onClick={() => setOptimistic(!optimistic)}
                        />
                      </h1>
                    </EuiTitle>
                  </EuiPageHeader>
                  <EuiPageContent>
                    <EuiPageContentBody>
                      <ListTodo />
                      {optimistic ? <AddTodo /> : <TraditionalAddTodo />}
                    </EuiPageContentBody>
                  </EuiPageContent>
                </EuiPageBody>
              </EuiPage>
            </>
          </I18nProvider>
        </Router>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </KibanaContextProvider>
  );
};
