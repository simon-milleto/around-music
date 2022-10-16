import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";

import { getCurrentUser, updateCurrentlyPlaying, getCurrentTrack } from "~/models/user.server";
import { updateArtist } from "~/models/artist.server";
import { getCurrentlyPlaying, getSpotifyArtist } from "~/services/spotify.server";

export const action: ActionFunction = async ({ request, params }) => {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
        return json({});
    }

    const spotifyCurrentTrack = await getCurrentlyPlaying(request);

    const userCurrentTrack = await getCurrentTrack(currentUser);

    if (spotifyCurrentTrack && (!userCurrentTrack || userCurrentTrack.Track.spotifyId !== spotifyCurrentTrack.id)) {
      const currentTrack = await updateCurrentlyPlaying(currentUser, spotifyCurrentTrack);

      for (const artist of currentTrack.Track.artists) {
        if (!artist.image) {
          const spotifyArtist = await getSpotifyArtist(request, artist.spotifyId);
          await updateArtist(spotifyArtist);
        }
      }

      return json(currentTrack);
    }
    
    return json(userCurrentTrack);
};

export const loader: LoaderFunction = async () => {
  return redirect("/");
};