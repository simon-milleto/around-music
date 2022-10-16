import type { SpotifyArtist } from "~/services/spotify.server";
import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function updateArtist(spotifyArtist: SpotifyArtist) {

  return await prisma.artist.update({
    where: {
      spotifyId: spotifyArtist.id
    },
    data: {
      name: spotifyArtist.name,
      link: spotifyArtist.external_urls.spotify,
      image: spotifyArtist.images ? spotifyArtist.images[0].url : null,
      genres: {
        connectOrCreate: spotifyArtist.genres.map((genre) => ({
            where: {
              name: genre
            }, 
            create: {
              name: genre
            }
        }))
      }
    }
  });
}