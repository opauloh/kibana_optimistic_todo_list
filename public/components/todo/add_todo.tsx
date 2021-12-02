import React, { useState } from 'react';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiSpacer,
  EuiText,
  EuiTextArea,
} from '@elastic/eui';
import uuid from 'uuid';
import { useTodoMutate } from './hooks';

export const AddTodo = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [description, setDescription] = useState('');

  const { createMutate } = useTodoMutate();

  const renderTodoForm = () => (
    <EuiForm>
      <EuiSpacer />
      <EuiTextArea
        fullWidth
        placeholder="Enter description, i.e: Send Mail"
        value={description}
        onChange={(e) => setDescription(e.currentTarget.value)}
      />
      <EuiSpacer />
      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiButtonEmpty onClick={() => setIsAdding(false)}>Cancel</EuiButtonEmpty>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            type="primary"
            isDisabled={description === ''}
            size="s"
            onClick={() => {
              createMutate({ description, id: uuid() });
              setDescription(''); // Clear textarea
            }}
          >
            Add Todo
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiForm>
  );
  return (
    <>
      <EuiSpacer />
      <EuiButtonEmpty color="primary" iconType="plus" onClick={() => setIsAdding(true)}>
        <EuiText color="subdued">Add Todo</EuiText>
      </EuiButtonEmpty>
      {isAdding && renderTodoForm()}
    </>
  );
};
