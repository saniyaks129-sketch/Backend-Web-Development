const prisma = require('../db/prisma');

// Helper to translate Prisma errors without leaking raw DB details
function handlePrismaError(err) {
  if (err.code === 'P2002') {
    const error = new Error('Duplicate record violates uniqueness constraint');
    error.statusCode = 409;
    throw error;
  }
  if (err.code === 'P2003') {
    const error = new Error('Referenced related record does not exist');
    error.statusCode = 400;
    throw error;
  }
  throw err;
}

async function findAll() {
  return prisma.post.findMany({ orderBy: { id: 'asc' } });
}

async function findById(id) {
  return prisma.post.findUnique({ where: { id: Number(id) } });
}

async function create(fields) {
  try {
    return await prisma.post.create({
      data: {
        title: fields.title,
        body: fields.body || '',
        authorId: Number(fields.authorId),
      },
    });
  } catch (err) {
    handlePrismaError(err);
  }
}

async function update(id, patch) {
  const existing = await findById(id);
  if (!existing) return null;

  try {
    return await prisma.post.update({
      where: { id: Number(id) },
      data: patch,
    });
  } catch (err) {
    handlePrismaError(err);
  }
}

async function remove(id) {
  const existing = await findById(id);
  if (!existing) return false;

  await prisma.post.delete({ where: { id: Number(id) } });
  return true;
}

module.exports = { findAll, findById, create, update, remove };