import { getAuth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { getToken } = getAuth(request)
  const token = await getToken()

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/juntas/`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  const data = await response.json()

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const { getToken } = getAuth(request)
  const token = await getToken()
  const requestBody = await request.json()
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/juntas/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })
  const data = await response.json()
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const { getToken } = getAuth(request)
  const token = await getToken()
  const requestBody = await request.json()
  console.log(requestBody)
  if (requestBody.id) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/juntas/${requestBody.id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json()
    return NextResponse.json(data)
  }
}


