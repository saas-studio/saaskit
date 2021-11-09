export default function Auth({headers}) {
    return {
      async createUser(user) {
        return fetch(`https://saas.dev/api/users`, { body: JSON.stringify(user), method: 'POST', headers }).then(res => res.json())
      },
      async getUser(id) {
        return fetch(`https://saas.dev/api/users/${id}`, {headers}).then(res => res.json())
      },
      async getUserByEmail(email) {
        return fetch(`https://saas.dev/api/users?email=${email}`, {headers}).then(res => res.json())
      },
      async getUserByAccount({ provider, providerAccountId }) {
        return fetch(`https://saas.dev/api/users/${provider}/${providerAccountId}`, {headers}).then(res => res.json())
      },
      async updateUser(user) {
        return fetch(`https://saas.dev/api/users`, { body: JSON.stringify(user), method: 'PATCH', headers}).then(res => res.json())
      },
      async deleteUser(userId) {
        fetch(`https://saas.dev/api/users/session/users/${userId}`, { method: 'DELETE', headers })
      },
      async linkAccount() {
        return
      },
      async unlinkAccount() {
        return
      },
      async createSession({ sessionToken, userId, expires }) {
        return fetch(`https://saas.dev/api/users/session`, { body: JSON.stringify({ sessionToken, userId, expires }), method: 'POST', headers }).then(res => res.json())
      },
      async getSessionAndUser(sessionToken) {
        return fetch(`https://saas.dev/api/users/session/${sessionToken}`).then(res => res.json())
      },
      async updateSession(session) {
        return fetch(`https://saas.dev/api/users/session/${session.sessionToken}`, { body: JSON.stringify(session), method: 'PUT', headers }).then(res => res.json())
      },
      async deleteSession(sessionToken) {
        fetch(`https://saas.dev/api/users/session/${sessionToken}`, { body: sessionToken, method: 'DELETE', headers })
      },
      async createVerificationToken({ identifier, expires, token }) {
        return fetch(`https://saas.dev/api/verification/token`, { body: JSON.stringify({ identifier, expires, token }), method: 'POST', headers }).then(res => res.json())
      },
      async useVerificationToken({ identifier, token }) {
        return fetch(`https://saas.dev/api/verification/token/${identifier}/${token}`, { headers }).then(res => res.json())
      },
    }
  }