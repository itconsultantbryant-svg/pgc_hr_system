/**
 * Ensure admin user exists with ADMIN role and known password (run on Render Shell):
 *   node scripts/create-admin.cjs
 * Or with custom credentials:
 *   ADMIN_EMAIL=you@domain.com ADMIN_PASSWORD='your-secure-password' node scripts/create-admin.cjs
 *
 * Re-running updates password and ensures userType is ADMIN (fixes wrong password / wrong role).
 */
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = (process.env.ADMIN_EMAIL || 'admin@prinstinegroup.com').trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD || 'admin123'

  const hashedPassword = await bcrypt.hash(password, 10)

  const existing = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
  })

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        email,
        password: hashedPassword,
        userType: 'ADMIN',
        isActive: true,
        isSuspended: false,
      },
    })
    console.log('Admin user ensured (password and ADMIN role updated):', email)
    return
  }

  const admin = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      userType: 'ADMIN',
      isActive: true,
      isSuspended: false,
    },
  })

  console.log('Admin user created:', email, 'ID:', admin.id)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
