"use client";
import React, { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Input } from '@/components/ui/input';

const Page = () => {
  const [dni, setDni] = useState('')
  const [memberInfo, setMemberInfo] = useState<any>(null)
  const [loans, setLoans] = useState<any[]>([])
  const [multas, setMultas] = useState<any[]>([])
  const [acciones, setAcciones] = useState<any[]>([])
  const [pagos, setPagos] = useState<any[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const memberResponse = await fetch(`/api/members/dni/${dni}`)
      const memberData = await memberResponse.json()
      setMemberInfo(memberData)

      if (memberData.id) {
        const [loansData, multasData, accionesData, pagosData] = await Promise.all([
          fetch(`/api/members/dni/${dni}/prestamos`).then(res => res.json()),
          fetch(`/api/members/dni/${dni}/multas`).then(res => res.json()),
          fetch(`/api/members/dni/${dni}/acciones`).then(res => res.json()),
          fetch(`/api/members/dni/${dni}/pagos`).then(res => res.json()),
        ])

        setLoans(loansData)
        setMultas(multasData)
        setAcciones(accionesData)
        setPagos(pagosData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Información del Socio</h1>
      
      <form onSubmit={handleSubmit} className="mb-4 flex w-max">
        <Input
          type="text"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          placeholder="Ingrese DNI"
          className="border p-2 mr-2"
        />
        <Button type="submit">Buscar</Button>
      </form>

      {memberInfo && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold">Información del miembro</h2>
            <p>Nombre: {memberInfo.full_name}</p>
            <p>Documento: {memberInfo.document_type}: {memberInfo.document_number}</p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold">Préstamos Activos</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Monto Original</TableHead>
                  <TableHead>Monto Adeudado</TableHead>
                  <TableHead>Cuotas Pendientes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.length > 0 ? (
                  loans.map((loan: any) => (
                    <TableRow key={loan.id}>
                      <TableCell>S/.{loan.amount}</TableCell>
                      <TableCell>S/.{loan.remaining_amount}</TableCell>
                      <TableCell>{loan.remaining_installments}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3}>No hay préstamos activos</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div>
            <h3 className="text-xl font-semibold">Historial de Pagos</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Monto</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagos.length > 0 ? (
                  pagos.map((pago: any) => (
                    <TableRow key={pago.id}>
                      <TableCell>S/.{pago.amount}</TableCell>
                      <TableCell>{format(new Date(pago.fecha_pago), "yyyy-MM-dd")}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2}>No hay pagos registrados</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Page
