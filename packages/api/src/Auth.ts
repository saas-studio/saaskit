import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import NextAuth, {NextAuthOptions} from 'next-auth'

export default function Auth(req: NextApiRequest, res: NextApiResponse, options: NextAuthOptions): ReturnType<NextApiHandler> {
  return NextAuth(req, res, options)
}
