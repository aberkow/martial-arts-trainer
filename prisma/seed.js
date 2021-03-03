const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const faker = require('faker')
const bcrypt = require('bcrypt')

async function main() {

  for (let index = 0; index < 101; index++) {

    const firstName = faker.name.firstName()
    const lastName = faker.name.lastName()

    await prisma.user.create({
      data: {
        uuid: faker.random.uuid(),
        email: faker.internet.email(),
        password: bcrypt.hashSync('test', 10),
        userName: faker.internet.userName(),
        name: `${firstName} ${lastName}`
      }
    })
  }

}

main()
  .catch(err => {
    console.error({ err });
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
