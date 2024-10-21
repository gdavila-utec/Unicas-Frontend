import { getAuth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, {params} : {params : {id : string}}) {
    const { getToken } = getAuth(request)
    const token = await getToken()
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/juntas/${params.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    const data = await response.json()
    return NextResponse.json(data)
  }

// Add delete method
export async function DELETE(request: NextRequest, {params} : {params : {id : string}}) {
  const { getToken } = getAuth(request)
  const token = await getToken()
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/juntas/${params.id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  if (response.ok) {
    return NextResponse.json({ message: 'Junta eliminada correctamente' })
  } else {
    return NextResponse.json({ message: 'Error al eliminar la junta' }, { status: 500 })
  }
}
