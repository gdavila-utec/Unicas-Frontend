import { getAuth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { getToken } = getAuth(request)
  const token = await getToken()

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/info`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  const data = await response.json()
 
  return NextResponse.json(data)
}