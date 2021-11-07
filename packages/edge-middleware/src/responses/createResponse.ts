export const createResponse = (format = 'text/plain; charset=utf-8') =>
  (body: string | object, options = {}) => {
    const { headers = {} , ...rest } = options as ResponseInit

    if (typeof body === 'object') {
      return new Response(JSON.stringify(body), {
        headers: {
          'Content-Type': format,
          ...headers,
        },
        ...rest,
      })
    }

    return new Response(body, options)
  }