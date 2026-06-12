import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { isSuperAdmin } from '@/lib/admin'

export async function GET() {
  const { userId } = await auth()

  return NextResponse.json({
    isAdmin: Boolean(userId && isSuperAdmin(userId)),
  })
}
