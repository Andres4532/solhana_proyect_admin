import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Rutas públicas que no requieren autenticación
  const publicRoutes = [
    '/catalogo',
    '/login',
    '/api/auth',
    '/_next',
    '/favicon.ico',
    '/public'
  ]

  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Si es una ruta pública, permitir acceso
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Para rutas administrativas, verificar autenticación
  // Aquí puedes agregar tu lógica de autenticación
  // Por ahora, permitir acceso a todas las rutas
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
