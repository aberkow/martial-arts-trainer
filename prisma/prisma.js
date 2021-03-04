import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// prisma.technique.findMany({
//   where: {
//     creatorId: 
//   }
// })

export default prisma