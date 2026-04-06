/**
 * Create admin user (run with: node scripts/create-admin.cjs)
 * Used in production release_command; idempotent.
 */
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@prinstinegroup.com'
  const password = process.env.ADMIN_PASSWORD || 'admin123'

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  })

  if (existingAdmin) {
    console.log('Admin user already exists:', email)
    return
  }

  const hashedPassword = await bcrypt.hash(password, 10)
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
