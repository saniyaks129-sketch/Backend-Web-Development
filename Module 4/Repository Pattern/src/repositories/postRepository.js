/**
 * Post Repository (In-Memory Array Implementation)
 * 
 * PRISMA SWAP PROOF:
 * When swapping this in-memory repository for a Prisma-backed implementation:
 * - WHAT WILL CHANGE: The internal `posts` array and `nextId` counter will be replaced with `prisma.post.*` queries.
 * - WHAT WILL REMAIN UNCHANGED: Method signatures (findAll, findById, create, update, remove, findByAuthor) and return shapes. Services will require zero code changes.
 */

const posts = []; // Private array storage
let nextId = 1;

export function findAll() {
  return [...posts]; // Shallow copy to prevent external mutation
}

export function findById(id) {
  return posts.find((p) => p.id === Number(id)) ?? null;
}

export function create(fields) {
  const record = { id: nextId++, ...fields };
  posts.push(record);
  return record;
}

export function update(id, patch) {
  const post = posts.find((p) => p.id === Number(id));
  if (!post) return null;

  Object.assign(post, patch);
  return post;
}

export function remove(id) {
  const index = posts.findIndex((p) => p.id === Number(id));
  if (index === -1) return false;

  posts.splice(index, 1);
  return true;
}

// Domain-shaped query
export function findByAuthor(authorId) {
  return posts.filter((p) => p.authorId === authorId);
}