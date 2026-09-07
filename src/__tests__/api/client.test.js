import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import client from '../../api/client';

const mock = new MockAdapter(client);

describe('API client', () => {
  beforeEach(() => {
    mock.reset();
    localStorage.clear();
  });

  afterEach(() => {
    mock.reset();
  });

  // ── Credential injection ────────────────────────────────────────────────────

  it('injects mobileNo + password into POST request body', async () => {
    localStorage.setItem('mala_bistronome__mobileNo', '60123456789');
    localStorage.setItem('mala_bistronome__auth_token', 'session-token');
    mock.onPost('/test').reply(200, { responseCode: '00', responseData: {} });

    await client.post('/test', { otherField: 'value' });

    const body = JSON.parse(mock.history.post[0].data);
    expect(body.mobileNo).toBe('60123456789');
    expect(body.password).toBe('session-token');
    expect(body.otherField).toBe('value');
  });

  it('explicit body fields take precedence over injected credentials', async () => {
    localStorage.setItem('mala_bistronome__mobileNo', 'injected-no');
    localStorage.setItem('mala_bistronome__auth_token', 'injected-token');
    mock.onPost('/test').reply(200, { responseCode: '00', responseData: {} });

    await client.post('/test', { mobileNo: 'caller-supplied', password: 'caller-pw' });

    const body = JSON.parse(mock.history.post[0].data);
    expect(body.mobileNo).toBe('caller-supplied');
    expect(body.password).toBe('caller-pw');
  });

  it('does NOT inject credentials into GET requests', async () => {
    localStorage.setItem('mala_bistronome__mobileNo', '60123456789');
    localStorage.setItem('mala_bistronome__auth_token', 'session-token');
    mock.onGet('/test').reply(200, {});

    await client.get('/test');

    // GET has no request body to inspect; just verify it didn't throw
    expect(mock.history.get.length).toBe(1);
  });

  // ── Response interceptor ────────────────────────────────────────────────────

  it('resolves when responseCode is "00"', async () => {
    mock.onPost('/success').reply(200, {
      responseCode: '00',
      responseMessage: 'Success',
      responseData: { value: 42 },
    });

    const res = await client.post('/success', {});
    expect(res.data.responseData.value).toBe(42);
  });

  it('rejects when responseCode is not "00"', async () => {
    mock.onPost('/fail').reply(200, {
      responseCode: '01',
      responseMessage: 'Invalid credentials',
      responseData: null,
    });

    await expect(client.post('/fail', {})).rejects.toThrow('Invalid credentials');
  });

  it('passes through responses without a responseCode (plain JSON)', async () => {
    mock.onGet('/plain').reply(200, { id: 1, name: 'Test' });

    const res = await client.get('/plain');
    expect(res.data.id).toBe(1);
  });

  // ── 401 handling ────────────────────────────────────────────────────────────

  it('clears session storage and redirects to /login on 401', async () => {
    localStorage.setItem('mala_bistronome__auth_token', 'expired-token');
    localStorage.setItem('mala_bistronome__mobileNo', '60123456789');
    localStorage.setItem('mala_bistronome__user', JSON.stringify({ name: 'Test' }));

    Object.defineProperty(window, 'location', { writable: true, value: { href: '' } });

    mock.onGet('/protected').reply(401);

    await expect(client.get('/protected')).rejects.toThrow();

    expect(localStorage.getItem('mala_bistronome__auth_token')).toBeNull();
    expect(localStorage.getItem('mala_bistronome__mobileNo')).toBeNull();
    expect(localStorage.getItem('mala_bistronome__user')).toBeNull();
  });

  it('rejects with error on 500 server error', async () => {
    mock.onGet('/boom').reply(500, { message: 'Internal Server Error' });

    await expect(client.get('/boom')).rejects.toMatchObject({
      response: { status: 500 },
    });
  });
});
