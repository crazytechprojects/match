import { BACKEND_API_ENDPOINT } from './constants';

function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function request(url, options = {}) {
  const response = await fetch(`${BACKEND_API_ENDPOINT}${url}`, options);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.detail || `Request failed (${response.status})`;
    throw new Error(message);
  }
  return response.json();
}

// Auth

export function signup(email, password) {
  return request('/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export function getMe(token) {
  return request('/auth/me', { headers: authHeaders(token) });
}

// Profile

export function getProfile(token) {
  return request('/profile/get', { headers: authHeaders(token) });
}

export function updateProfile(token, data) {
  return request('/profile/update', {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

// Agent

export function getAgentStatus(token) {
  return request('/agent/status', { headers: authHeaders(token) });
}

// Conversations

export function listConversations(token, status = null) {
  const query = status ? `?status=${status}` : '';
  return request(`/conversations/list${query}`, {
    headers: authHeaders(token),
  });
}

export function getConversation(token, conversationId) {
  return request(`/conversations/${conversationId}`, {
    headers: authHeaders(token),
  });
}

export function sendMessage(token, conversationId, text) {
  return request(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ text }),
  });
}
