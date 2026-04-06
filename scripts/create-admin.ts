/**
 * Ensure admin user exists (dev): npx tsx scripts/create-admin.ts
 * Same env vars as create-admin.cjs (ADMIN_EMAIL, ADMIN_PASSWORD).
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

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

  console.log('Admin user created successfully!')
  console.log(`Email: ${email}`)
  console.log(`User ID: ${admin.id}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
