import { getAccessToken } from '~/session.server';

const BASE_URL = 'https://api.spotify.com/v1';

export type SpotifyUser = {
    country: string;
    display_name: string;
    email: string;
    explicit_content: {
        filter_enabled: boolean;
        filter_locked: boolean;
    };
    external_urls: {
        spotify: string;
    };
    followers: {
        href: string;
        total: number;
    };
    href: string;
    id: string;
    images: {
            url: string;
            height: number
            width: number;
        }[];
    product: string;
    type: string;
    uri: string;
}

export type SpotifyTrackResponse = {
    item: SpotifyTrack;
}

export type SpotifyTrack = {
    album: {
        id: string;
        name: string;
        images: {
            url: string;
            height: number
            width: number;
        }[];
        external_urls: {
            spotify: string;
        };
        artists: {
            id: string;
            name: string;
            images: {
                url: string;
                height: number
                width: number;
            }[];
            genres: string[]
        }[];
    };
    artists: {
        id: string;
        name: string;
        images: {
            url: string;
            height: number
            width: number;
        }[];
        genres: string[]
    }[];
    id: string;
    name: string;
    preview_url: string;
    external_urls: {
        spotify: string;
    }
}

export type SpotifyArtist = {
    external_urls: {
      spotify: string;
    };
    followers: {
      href: string;
      total: number;
    },
    genres: string[];
    href: string;
    id: string;
    images: {
        url: string;
        height: number
        width: number;
    }[];
    name: string;
    popularity: number;
    type: "artist";
    uri: string;
  }

export async function getSpotifyUser(request: Request, accessToken?: string): Promise<SpotifyUser> {
    const bearerAccessToken = accessToken || await getAccessToken(request);

    const res: Response = await fetch(`${BASE_URL}/me`, {
        headers: {
            'Authorization': `Bearer ${bearerAccessToken}`
          }
      });
    const response = await res.json() as SpotifyUser;

    return response;
}

export async function getSpotifyArtist(request: Request, spotifyArtistId: string): Promise<SpotifyArtist> {
    const bearerAccessToken = await getAccessToken(request);

    const res: Response = await fetch(`${BASE_URL}/artists/${spotifyArtistId}`, {
        headers: {
            'Authorization': `Bearer ${bearerAccessToken}`
          }
      });
    const response = await res.json() as SpotifyArtist;

    return response;
}

export async function getCurrentlyPlaying(request: Request): Promise<SpotifyTrack|null> {
    const bearerAccessToken = await getAccessToken(request);

    const res: Response = await fetch(`${BASE_URL}/me/player/currently-playing`, {
        headers: {
            'Authorization': `Bearer ${bearerAccessToken}`
          }
      });
    
    if (res.status !== 200) {
        return null;
    }

    const response = await res.json() as SpotifyTrackResponse;

    return response.item;
}