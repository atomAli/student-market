import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const productId = 'cmr80fjmt0001l7047x0c3sqw';

  const msgs = await prisma.message.deleteMany({
    where: { conversation: { productId } }
  });
  console.log('Messages deleted:', msgs.count);

  const convs = await prisma.conversation.deleteMany({
    where: { productId }
  });
  console.log('Conversations deleted:', convs.count);

  const prod = await prisma.product.delete({
    where: { id: productId }
  });
  console.log('Product deleted:', prod.title);
}

main().catch(console.error).finally(() => prisma.$disconnect());
