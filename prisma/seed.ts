// import type { Fighter } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { moveFrom } from '../app/utils/geo';
// import bcrypt from 'bcryptjs';
let prisma = new PrismaClient();

const countUser = 5;

const randomPick = <T>(values: T[]): T => {
  const index = Math.floor(Math.random() * values.length);
  return values[index];
}

const randomIntFromInterval = (min: number, max: number): number => { 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const mtpCoords = {
  latitude: 43.609460,
  longitude: 3.876778
}

async function seed() {
  // first clean database
  await prisma.currentTrack.deleteMany({});
  await prisma.geolocation.deleteMany({});
  await prisma.user.deleteMany({});
  // await prisma.track.deleteMany({});
  // await prisma.album.deleteMany({});

  const itemCount = await prisma.track.count();
  const count = 1;

  
  
  for (let index = 0; index < countUser; index++) {
    const skip = Math.max(0, Math.floor(Math.random() * itemCount) - count);
  
    const orderBy = randomPick<'id' | 'spotifyId' | 'name'>(['id', 'spotifyId', 'name'])
    const orderDir = randomPick<'asc' | 'desc'>(['asc', 'desc']);

    const tracks = await prisma.track.findMany({
      take: count,
      skip: skip,
      orderBy: { [orderBy]: orderDir }
    });
    
    const userMtp = await prisma.user.create({
        data: {
          name: 'Montpellier-'+index,
          email: 'montpellier@mtp.com'+index,
          spotifyId: 'user-1234-'+index,
        },
      });
  
    await prisma.currentTrack.create({
      data: {
        userId: userMtp.id,
        trackId: tracks[0].id
      }
    });
  
    const coords = moveFrom(mtpCoords.latitude, mtpCoords.longitude, randomIntFromInterval(100, 2000), Math.PI / randomIntFromInterval(1, 5));

    await prisma.geolocation.create({
      data: {
        latitude: coords.lat,
        longitude: coords.lng,
        userId: userMtp.id
      },
    });
}


  // const track = await prisma.track.create({
  //   data: {
  //     name: 'Music montpellier',
  //     spotifyId: 'music-1234',
  //     Album: {
  //         create: {
  //             spotifyId: 'album-1234',
  //             name: 'Album montpellier',
  //             image: 'https://i.scdn.co/image/ab67616d0000b273e1530b42603367fdb2208d88',
  //             artists: {
  //               create: {
  //                   spotifyId: 'artist-1234',
  //                   name: 'Artist montpellier'
  //               }
  //             }    
  //           },
  //     }
  //   }
  // });

}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
