import { EdgeRequest } from '../request'
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

export const withUser = async (req: EdgeRequest) => {
    // const session = await getToken({ req, secret: process.env.SECRET })
    // if (!session) {
    //     return NextResponse
    // }
    // request.user
}