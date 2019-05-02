import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
import getUserId from '../utils/getUserId';
import generateToken from '../utils/generateToken';
import hashPassword from '../utils/hashPassword';

const Mutation = {

  async createUser(parent, args, { prisma }, info) {

    console.log('args.data in createUser is: ', args.data)

    const password = await hashPassword(args.data.password);

    const user = await prisma.mutation.createUser({
      data: {
        ...args.data,
        password
      }
    });

    return {
      user,
      token: generateToken(user.id)
    }
  },

  async login(parent, args, { prisma }, info) {
    const user = await prisma.query.user({
      where: {
        email: args.data.email
      }
    });

    if (!user) {
      throw new Error('Unable to login');
    }

    const isMatch = await bcrypt.compare(args.data.password, user.password);

    if (!isMatch) {
      throw new Error('Unable to login');
    }

    return {
      user,
      token: generateToken(user.id)
    };
  },

  deleteUser(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);
    return prisma.mutation.deleteUser({
      where: {
        id: userId
      }
    }, info);

  },

  async updateUser(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);

    if (typeof args.data.password === 'string') {
      args.data.password = await hashPassword(args.data.password);
    }

    return prisma.mutation.updateUser({
      where: {
        id: userId
      },
      data: args.data
    }, info);

  },

  async createPalette(parent, args, { prisma, request }, info) {

    const userId = getUserId(request);

    return await prisma.mutation.createPalette({      
      data: {
        name: args.data.name,
        description: args.data.description,
        colors: { set: args.data.colors },

        author: {
          connect: {
            id: userId
          }
        }
      }
    }, info);
  },

  async deletePalette(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);

    const paletteExists = await prisma.exists.Palette({
      id: args.id,
      author: {
        id: userId
      }
    });

    if (!paletteExists) {
      throw new Error('Unable to delete palette');
    }

    return prisma.mutation.deletePalette({
      where: {
        id: args.id
      }
    }, info);
  },

  async updatePalette(parent, args, { prisma, request }, info) {

    const userId = getUserId(request);

    const paletteExists = await prisma.exists.Palette({
      id: args.id,
      author: {
        id: userId
      }
    });

    // const isPublished = await prisma.exists.Post({ id: args.id, published: true})

    if (!paletteExists) {
      throw new Error('Unable to update palette');
    }

    // if (isPublished && args.data.published === false) {
    //   await prisma.mutation.deleteManyComments({ where: { post: { id: args.id } } })
    // }

    return prisma.mutation.updatePalette({
      where: {
        id: args.id
      },
      data: args.data
    }, info);
  },

};

export { Mutation as default };
