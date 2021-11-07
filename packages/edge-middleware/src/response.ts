import { NextResponse } from 'next/server'

export class EdgeResponse extends NextResponse {
  constructor(body?: BodyInit | null, init?: ResponseInit) {
       super(body, init)
  }
}
