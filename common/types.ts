export interface Todo {
  _id: string;
  _source: {
    description: string;
    completed: boolean;
    timestamp: string;
    placeholder?: boolean;
  };
}

export interface TodoListResponse {
  hits: Array<Todo>;
  total: {
    value: number;
  };
}
