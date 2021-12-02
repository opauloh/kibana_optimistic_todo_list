import React from 'react';
import {
  EuiListGroup,
  EuiListGroupItem,
  EuiLoadingContent,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { FormattedMessage } from 'react-intl';
import { useQuery } from 'react-query';
import { TODO_ROUTE } from '../../../common';
import { TodoListResponse } from '../../../common/types';
import { useKibana } from '../../../../../src/plugins/kibana_react/public';
import { CoreStart } from 'kibana/public';
import { useTodoMutate } from './hooks';

export const ListTodo = () => {
  const { http } = useKibana<CoreStart>().services;
  const { data, isLoading } = useQuery('todos', () => http.get<TodoListResponse>(TODO_ROUTE));
  const { updateMutate, deleteMutate } = useTodoMutate();

  if (!data) {
    return <EuiLoadingContent lines={3} />;
  }

  return (
    <>
      <EuiText>
        <p>
          <FormattedMessage
            id="kibanaOptimisticTodoList.timestampText"
            defaultMessage="Your todo list: {value}"
            values={{ value: data?.total?.value }}
          />
        </p>
      </EuiText>
      <EuiSpacer />
      <EuiListGroup flush={true} maxWidth="100%">
        {data.hits.map((d) => (
          <EuiListGroupItem
            css={d._source.completed ? `text-decoration: line-through;` : ''}
            extraAction={{
              color: 'danger',
              onClick: () => deleteMutate({ id: d._id }),
              iconType: 'cross',
              iconSize: 's',
              'aria-label': 'Delete Todo',
              alwaysShow: false,
            }}
            onClick={() => updateMutate({ id: d._id, completed: !d._source.completed })}
            label={d._source.description}
            color="subdued"
            isDisabled={d._source.placeholder}
          />
        ))}
      </EuiListGroup>
      {isLoading && <EuiLoadingContent lines={3} />}
    </>
  );
};
