import { Adapter, AdapterUser, AdapterSession, VerificationToken } from 'next-auth/adapters'
import fetchJSON from '../utils/fetch-json'

export default function Auth(client, options = {}): Adapter {
    return {
      async createUser(user) {
        return fetchJSON<AdapterUser>(`https://saas.dev/api/users`, { body: user, method: 'POST' })
      },
      async getUser(id) {
        return fetchJSON<AdapterUser>(`https://saas.dev/api/users/${id}`)
      },
      async getUserByEmail(email) {
        return fetchJSON<AdapterUser>(`https://saas.dev/api/users`, {query: { email } })
      },
      async getUserByAccount({ provider, providerAccountId }) {
        return fetchJSON<AdapterUser>(`https://saas.dev/api/users`, {query: { provider, providerAccountId } })
      },
      async updateUser(user) {
        return fetchJSON<AdapterUser>(`https://saas.dev/api/users`, { body: user, method: 'PATCH' })
      },
      async deleteUser(userId) {
        return fetchJSON<AdapterUser>(`https://saas.dev/api/users/${userId}`, { method: 'DELETE' })
      },
      async linkAccount() {
        return
      },
      async unlinkAccount() {
        return
      },
      async createSession({ sessionToken, userId, expires }) {
        return fetchJSON<AdapterSession>(`https://saas.dev/api/users/session`, { body: { sessionToken, userId, expires }, method: 'POST' })
      },
      async getSessionAndUser(sessionToken) {
        return fetchJSON(`https://saas.dev/api/users/session/${sessionToken}`)
      },
      async updateSession(session) {
        return fetchJSON<AdapterSession>(`https://saas.dev/api/users/session/${session.sessionToken}`, { body: session, method: 'PUT' })
      },
      async deleteSession(sessionToken) {
        return fetchJSON<AdapterSession>(`https://saas.dev/api/users/session/${sessionToken}`, { body: sessionToken, method: 'DELETE' })
      },
      async createVerificationToken({ identifier, expires, token }) {
        return  fetchJSON<VerificationToken>(`https://saas.dev/api/verification/token`, { body: { identifier, expires, token }, method: 'POST' })
      },
      async useVerificationToken({ identifier, token }) {
        return fetchJSON<VerificationToken>(`https://saas.dev/api/verification/token/${identifier}/${token}`)
      },
    }
  }