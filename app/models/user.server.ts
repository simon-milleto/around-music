import type { User } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import type { SpotifyTrack } from "~/services/spotify.server";
import { moveFrom, randomPick } from '~/utils';
import { prisma } from "~/db.server";
import { getEmail } from "~/session.server";

export type { User } from "@prisma/client";

const DISTANCE_AROUND = 10000;

type Geolocation = {
  latitude: number;
  longitude: number;
}

export type FullCurrentTrack = Prisma.CurrentTrackGetPayload<{
  include: {
    Track: {
      include: {
        Album: true,
        artists: {
          include: {
            genres: true
          }
        }
      }
    }
  }
}>

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getCurrentUser(request: Request) {
    const email = await getEmail(request);

    return await getUserByEmail(email);
}

export async function getCurrentTrackAround(user: User): Promise<FullCurrentTrack[]> {
  const geolocation = await prisma.geolocation.findUnique({
    where: {
      userId: user.id
    }
  });

  const itemCount = await prisma.currentTrack.count();
  const count = 20;

  const skip = Math.max(0, Math.floor(Math.random() * itemCount) - count);

  const orderBy = randomPick<'id' | 'trackId' | 'userId'>(['id', 'trackId', 'userId'])
  const orderDir = randomPick<'asc' | 'desc'>(['asc', 'desc']);

  if (geolocation) {
    const northEast = moveFrom(geolocation.latitude, geolocation.longitude, DISTANCE_AROUND, Math.PI / 4);
    const southWest = moveFrom(geolocation.latitude, geolocation.longitude, DISTANCE_AROUND, Math.PI * 5 / 4);

    const currentAround = await prisma.currentTrack.findMany({
      where: {
        User: {
          is: {
            geolocation: {
              is: {
                latitude: {
                  lte: northEast.lat,
                  gte: southWest.lat
                },
                longitude: {
                  lte: northEast.lng,
                  gte: southWest.lng
                }
              }
            }
          },
          isNot: {
            id: user.id
          }
        },
      },
      take: count,
      skip: skip,
      orderBy: { [orderBy]: orderDir },
      include: {
        Track: {
          include: {
            Album: true,
            artists: {
              include: {
                genres: true
              }
            }
          }
        }
      }
    });

    return currentAround;
  }

  return [];
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function updateGeolocation(user: User, geolocation: Geolocation) {
  return await prisma.geolocation.upsert({
    where: {
      userId: user.id,
    },
    update: {
      latitude: geolocation.latitude,
      longitude: geolocation.longitude
    },
    create: {
      latitude: geolocation.latitude,
      longitude: geolocation.longitude,
      userId: user.id
    },
  });
}

export async function getCurrentTrack(user: User) {
  return await prisma.currentTrack.findUnique({
    where: {
      userId: user.id
    },
    include: {
      Track: {
        include: {
          Album: true,
          artists: {
            include: {
              genres: true
            }
          }
        }
      }
    }
  })
}

export async function updateCurrentlyPlaying(user: User, spotifyTrack: SpotifyTrack) {

  const track = await prisma.track.upsert({
    where: {
      spotifyId: spotifyTrack.id,
    },
    update: {},
    create: {
      name: spotifyTrack.name,
      spotifyId: spotifyTrack.id,
      link: spotifyTrack.external_urls.spotify,
      previewUrl: spotifyTrack.preview_url,
      artists: {
        connectOrCreate: spotifyTrack.artists.map((artist) => ({
          where: {
            spotifyId: artist.id
          },
          create: {
            spotifyId: artist.id,
            name: artist.name,
            image: artist.images ? artist.images[0].url : null
          },
        }))
      },
      Album: {
          connectOrCreate: {
            where: {
              spotifyId: spotifyTrack.album.id
            },
            create: {
              spotifyId: spotifyTrack.album.id,
              name: spotifyTrack.album.name,
              image: spotifyTrack.album.images[0].url,
              link: spotifyTrack.album.external_urls.spotify,
              artists: {
                connectOrCreate: spotifyTrack.album.artists.map((artist) => ({
                  where: {
                    spotifyId: artist.id
                  },
                  create: {
                    spotifyId: artist.id,
                    name: artist.name,
                    image: artist.images ? artist.images[0].url : null
                  },
                }))
              }    
            },
          }
        }
      }
  });

  return await prisma.currentTrack.upsert({
    where: {
      userId: user.id
    },
    update: {
      trackId: track.id
    },
    create: {
      userId: user.id,
      trackId: track.id
    },
    include: {
      Track: {
        include: {
          Album: true,
          artists: {
            include: {
              genres: true
            }
          }
        }
      }
    }
  })
}

export async function createUser(name: User["name"], email: User["email"], spotifyId: User["spotifyId"]): Promise<User> {

  return await prisma.user.create({
    data: {
      name,
      email,
      spotifyId,
    },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}