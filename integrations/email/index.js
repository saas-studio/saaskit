import replyParser from 'node-email-reply-parser'

export const getEmailText = ({params}) => {
    const email = replyParser(params.emailContent)
    const text = email.getVisibleText()
    return { text }
}