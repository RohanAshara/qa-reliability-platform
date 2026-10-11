import { test, expect } from '@playwright/test';
import { ApiClient } from '../../clients/apiClient';

/**
 * ============================================================================
 * Example: Testing an External Open-Source Project (JSONPlaceholder)
 * GitHub Repo: https://github.com/typicode/jsonplaceholder
 * Live Public Endpoint: https://jsonplaceholder.typicode.com
 * ============================================================================
 */
test.describe('External Public Project: JSONPlaceholder API Tests', () => {
  const TARGET_URL = 'https://jsonplaceholder.typicode.com';

  test('1. Get all posts and verify schema & SLA latency < 1500ms', async ({ request }) => {
    const client = new ApiClient(request, TARGET_URL);
    const result = await client.get('/posts');

    // Verify HTTP 200 OK
    expect(result.response.status()).toBe(200);

    // Verify data format and length
    expect(Array.isArray(result.body)).toBeTruthy();
    expect(result.body.length).toBe(100);

    // Verify individual post schema
    const firstPost = result.body[0];
    expect(firstPost).toHaveProperty('id');
    expect(firstPost).toHaveProperty('title');
    expect(firstPost).toHaveProperty('body');
    expect(firstPost).toHaveProperty('userId');

    // Verify SLA performance latency
    expect(result.durationMs).toBeLessThan(1500);
  });

  test('2. Get single post by ID (GET /posts/1)', async ({ request }) => {
    const client = new ApiClient(request, TARGET_URL);
    const result = await client.get('/posts/1');

    expect(result.response.status()).toBe(200);
    expect(result.body.id).toBe(1);
    expect(result.body.userId).toBe(1);
  });

  test('3. Create a new post and verify 201 Created (POST /posts)', async ({ request }) => {
    const client = new ApiClient(request, TARGET_URL);
    const newPost = {
      title: 'Automated Platform Test by Rohan',
      body: 'Verifying external open-source integration.',
      userId: 1,
    };

    const result = await client.post('/posts', newPost);

    expect(result.response.status()).toBe(201);
    expect(result.body.title).toBe(newPost.title);
    expect(result.body.body).toBe(newPost.body);
    expect(result.body).toHaveProperty('id');
  });

  test('4. Delete a post and verify 200 OK (DELETE /posts/1)', async ({ request }) => {
    const client = new ApiClient(request, TARGET_URL);
    const result = await client.delete('/posts/1');

    expect(result.response.status()).toBe(200);
  });
});
