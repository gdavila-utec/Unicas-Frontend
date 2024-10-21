import { NextRequest, NextResponse } from 'next/server';
// Import getAuth for authentication
import { getAuth } from '@clerk/nextjs/server';


  export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { getToken } = getAuth(request);
  const token = await getToken();

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/agenda/junta/${params.id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const agendaItems = await response.json(); // Get agenda items from the response
  return NextResponse.json(agendaItems);
}

export async function POST(request: NextRequest) {
  try {
    const { getToken } = getAuth(request);
    const token = await getToken();
    const data = await request.json();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/agenda/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        junta: data.juntaId, // Ensure juntaId is sent correctly
        content: data.content,   // Ensure content is sent correctly
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const newAgendaItem = await response.json(); // Get the newly created agenda item
    return NextResponse.json(newAgendaItem, { status: 201 }); // Return the new item
  } catch (error) {
    console.error('Error posting agenda item:', error);
    return NextResponse.json({ error: 'Failed to post agenda item' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { getToken } = getAuth(request);
    const token = await getToken();
    const data = await request.json();
    const { id, content } = data; // Assuming id is sent in the request body
    console.log(params.id);
    console.log(content);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/agenda/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        junta: params.id,
        content: content,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const updatedAgendaItem = await response.json(); // Get the updated agenda item
    return NextResponse.json(updatedAgendaItem, { status: 200 });
  } catch (error) {
    console.error('Error updating agenda item:', error);
    return NextResponse.json({ error: 'Failed to update agenda item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { getToken } = getAuth(request);
    const token = await getToken();
    const { id } = await request.json(); // Assuming id is sent in the request body

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/agenda/${id}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return NextResponse.json({ message: 'Agenda item deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting agenda item:', error);
    return NextResponse.json({ error: 'Failed to delete agenda item' }, { status: 500 });
  }
}