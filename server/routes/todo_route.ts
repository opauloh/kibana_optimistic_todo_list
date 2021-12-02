/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { schema } from '@kbn/config-schema';
import { IRouter } from '../../../../src/core/server';
import { TODO_ROUTE } from '../../common';

const path = TODO_ROUTE;
const index = 'todo';

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const registerTodoRoute = (router: IRouter) => {
  router.get({ path, validate: {} }, async (context, request, response) => {
    const client = context.core.elasticsearch.client.asCurrentUser;

    const checkIndexExists = await client.indices.exists({ index });

    if (!checkIndexExists.body) {
      await client.indices.create({
        index,
        mappings: {
          properties: {
            description: { type: 'text' },
            completed: { type: 'boolean' },
            timestamp: { type: 'date' },
          },
        },
      });
    }

    const search = await client.search({
      index,
      size: 100,
      body: { sort: { timestamp: { order: 'asc' } } },
    });

    return response.ok({ body: search.body.hits });
  });

  router.post(
    {
      path,
      validate: {
        body: schema.object({ id: schema.string(), description: schema.string() }),
      },
    },
    async (context, request, response) => {
      const { id, description } = request.body;

      const client = context.core.elasticsearch.client.asCurrentUser;

      // Force error with slow response for testing purposes
      if (description === 'force error') {
        await sleep(7000);
        return response.badRequest({ body: 'Something went wrong' });
      }

      const todo = {
        index,
        id,
        body: {
          description,
          completed: false,
          timestamp: new Date().toISOString(),
        },
        refresh: 'wait_for',
      } as const;

      await client.create(todo);

      return response.ok({ body: { message: 'Todo added!', todo } });
    }
  );
  router.put(
    {
      path,
      validate: {
        body: schema.object({ completed: schema.boolean(), id: schema.string() }),
      },
    },
    async (context, request, response) => {
      const { completed, id } = request.body;

      const client = context.core.elasticsearch.client.asCurrentUser;

      // make requests randomly slow and fails 20% of the time, for testing purposes
      if (Math.random() > 0.8) {
        await sleep(2000);
        return response.badRequest({ body: 'Something went wrong' });
      }

      const req = await client.update({
        index,
        id,
        body: { doc: { completed } },
      });

      return response.ok({ body: { message: 'Todo updated!', todo: req.body } });
    }
  );

  router.delete(
    { path, validate: { body: schema.object({ id: schema.string() }) } },
    async (context, request, response) => {
      const { id } = request.body;
      const client = context.core.elasticsearch.client.asCurrentUser;

      // make requests randomly slow and fails 20% of the time, for testing purposes
      if (Math.random() > 0.8) {
        await sleep(2000);
        return response.badRequest({ body: 'Something went wrong' });
      }

      await client.delete({ index, id });

      return response.ok({ body: { message: 'Todo Deleted!' } });
    }
  );
};
