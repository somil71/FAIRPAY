import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const contractId = '0x2C049AE6';
  console.log(`Checking contract: ${contractId}`);
  
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: { milestones: true }
  });
  
  if (!contract) {
    console.log('Contract not found in DB.');
    return;
  }
  
  console.log('Contract Status:', contract.status);
  console.log('Milestones:');
  contract.milestones.forEach(m => {
    console.log(`- Index: ${m.index}, Status: ${m.status}, ID: ${m.id}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
