import getUserId from "../utils/getUserId";

const Query = {
  users(parent, args, { prisma }, info) {

    const opArgs = {
      first: args.first,
      skip: args.skip,
      after: args.after,
      orderBy: args.orderBy
    };

    if (args.query) {
      opArgs.where = {
        OR: [{
          name_contains: args.query
        }]
      }
    }

    return prisma.query.users(opArgs, info)
  },  

  me(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)

    return prisma.query.user({
      where: {
        id: userId
      }
    }, info)
  },
  
  palettes(parent, args, { prisma, request }, info) {

    const userId = getUserId(request);  // no false for second parameter because we want authentication
    
    const opArgs = {
      where: {
        author: {
          id: userId
        }
      },
      first: args.first,
      skip: args.skip,
      after: args.after,
      orderBy: args.orderBy
    };

    if (args.query) {
      opArgs.where.OR = [{
        name_contains: args.query
      }, {
        description_contains: args.query
      }];
    }
    
    return prisma.query.palettes(opArgs, info);
  },

  async onePalette(parent, args, { prisma, request }, info) {

    const userId = getUserId(request, false)
    
    const palettes = await prisma.query.palettes({  //have to use posts to access where
      where: {
        id: args.id,  //limits to one post
        OR: [{
          author: {
            id: userId
          }
        }]
      }
    }, info);

    if (palettes.length === 0) {
      throw new Error('Palette not found');
    }

    return palettes[0];
   },
}

export { Query as default };
