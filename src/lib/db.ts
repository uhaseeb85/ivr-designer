import jsonDb from './jsondb';

// This file serves as an adapter between the application and the database
// It can be switched between Prisma and JSON DB without changing the application code

const db = {
  user: {
    findMany: (args?: any) => jsonDb.user.findMany(args?.where),
    findUnique: (args: any) => jsonDb.user.findUnique(args.where),
    create: (args: any) => jsonDb.user.create(args.data),
    update: (args: any) => jsonDb.user.update(args.where, args.data),
    delete: (args: any) => jsonDb.user.delete(args.where),
  },
  project: {
    findMany: (args?: any) => jsonDb.project.findMany(args?.where),
    findUnique: (args: any) => jsonDb.project.findUnique(args.where),
    create: (args: any) => jsonDb.project.create(args.data),
    update: (args: any) => jsonDb.project.update(args.where, args.data),
    delete: (args: any) => jsonDb.project.delete(args.where),
  },
  token: {
    findMany: (args?: any) => jsonDb.token.findMany(args?.where),
    findUnique: (args: any) => jsonDb.token.findUnique(args.where),
    create: (args: any) => jsonDb.token.create(args.data),
    update: (args: any) => jsonDb.token.update(args.where, args.data),
    delete: (args: any) => jsonDb.token.delete(args.where),
  },
  flow: {
    findMany: (args?: any) => jsonDb.flow.findMany(args?.where),
    findUnique: (args: any) => jsonDb.flow.findUnique(args.where),
    create: (args: any) => jsonDb.flow.create(args.data),
    update: (args: any) => jsonDb.flow.update(args.where, args.data),
    delete: (args: any) => jsonDb.flow.delete(args.where),
  },
  node: {
    findMany: (args?: any) => jsonDb.node.findMany(args?.where),
    findUnique: (args: any) => jsonDb.node.findUnique(args.where),
    create: (args: any) => jsonDb.node.create(args.data),
    update: (args: any) => jsonDb.node.update(args.where, args.data),
    delete: (args: any) => jsonDb.node.delete(args.where),
  }
};

export default db; 