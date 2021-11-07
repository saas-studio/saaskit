import { status } from "../responses"

export const trackRequest = (request: Request) => {

    let headers = request.headers || {}
    try {
        request.headers.forEach(pair => {
            let [key, value] = pair.split('=')
            // @ts-ignore
            headers[key] = value
        })
    } catch (err) {
        // Todo: Figure out how to handle these types of errors
    }

    // Todo: Save the event to the backend
}

export const captureEvent = (request: Request) => {
    // Todo: Save the vital data to the backend
    status(204)
}