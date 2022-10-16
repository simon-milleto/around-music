import { createCookieSessionStorage, redirect, json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { v4 as uuidv4 } from 'uuid';
import { getSpotifyUser } from '~/services/spotify.server';
import { getUserByEmail, createUser } from '~/models/user.server';

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

const SPOTIFY_REDIRECT_URL = process.env.SPOTIFY_REDIRECT_URL;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

const getLoginURL = (scopes: string[]): string => {
  return 'https://accounts.spotify.com/authorize?client_id=' + SPOTIFY_CLIENT_ID +
    '&redirect_uri=' + encodeURIComponent(SPOTIFY_REDIRECT_URL) +
    '&scope=' + encodeURIComponent(scopes.join(' ')) +
    '&state=' + uuidv4() +
    '&response_type=code';
};

const authorizeURL = getLoginURL([
  'user-read-recently-played',
  'user-read-currently-playing',
  'user-read-email'
]);

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

const ACCESS_TOKEN_KEY = "access_token_spotify";
const REFRESH_TOKEN_KEY = "refresh_token_spotify";
const EXPIRATION_TOKEN_DATE_KEY = "expiration_token_date";
const EMAIL_USER_KEY = "email_user";

type AccessTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function getAccessToken(request: Request) {
  const session = await getSession(request);

  return session.get(ACCESS_TOKEN_KEY);
}

export async function getEmail(request: Request) {
  const session = await getSession(request);

  return session.get(EMAIL_USER_KEY);
}

export async function isLogged(request: Request) {
  const session = await getSession(request);

  if (session.get(ACCESS_TOKEN_KEY) && 
      session.get(EXPIRATION_TOKEN_DATE_KEY) && session.get(EXPIRATION_TOKEN_DATE_KEY) > Date.now()) {
        return true;
  } else if (!session.get(ACCESS_TOKEN_KEY)) {
    return false;
  } else if (session.get(EXPIRATION_TOKEN_DATE_KEY) && session.get(EXPIRATION_TOKEN_DATE_KEY) < Date.now()) {
      return false;
  }

  return false;
}

export async function canTryRefresh(request: Request): Promise<boolean> {
  const session = await getSession(request);

  return session.get(REFRESH_TOKEN_KEY) && session.get(EXPIRATION_TOKEN_DATE_KEY);
}

export async function tryToLogin(request: Request) {
  const session = await getSession(request);

  if (!session.get(ACCESS_TOKEN_KEY) || !session.get(REFRESH_TOKEN_KEY) || !session.get(EXPIRATION_TOKEN_DATE_KEY)) {
    return redirect(authorizeURL);
  }

  if (session.get(EXPIRATION_TOKEN_DATE_KEY) < Date.now()) {
    return refreshToken(request);
  }
}

export async function loginWithCode(request: Request) {
  const url = new URL(request.url);
  const code = (new URLSearchParams(url.search)).get('code');

  if (!code) {
    return json({});
  }

  const data = new URLSearchParams();
  data.append('code', code);
  data.append('redirect_uri', SPOTIFY_REDIRECT_URL);
  data.append('grant_type', 'authorization_code');

  const session = await getSession(request);
  
  const res: Response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    body: data,
    headers: {
      'Authorization': 'Basic ' + (Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
  });

  try {
    const result = await res.json() as AccessTokenResponse;

    const spotifyUser = await getSpotifyUser(request, result.access_token);

    session.set(ACCESS_TOKEN_KEY, result.access_token);
    session.set(REFRESH_TOKEN_KEY, result.refresh_token);
    session.set(EXPIRATION_TOKEN_DATE_KEY, Date.now() + (result.expires_in * 1000));
    session.set(EMAIL_USER_KEY, spotifyUser.email);

    const userDb = await getUserByEmail(spotifyUser.email);
    if (!userDb) {
      await createUser(spotifyUser.display_name, spotifyUser.email, spotifyUser.id);
    }

  } catch (error) {
    
  }

  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: 60 * 60 * 24 * 365
      })
    }
  });
}

export async function refreshToken(request: Request) {
  const session = await getSession(request);
  const refreshToken = session.get(REFRESH_TOKEN_KEY);

  const data = new URLSearchParams();
  data.append('refresh_token', refreshToken);
  data.append('grant_type', 'refresh_token');

  const res: Response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    body: data,
    headers: {
      'Authorization': 'Basic ' + (Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
  });

  const result = await res.json() as AccessTokenResponse;

  session.set(ACCESS_TOKEN_KEY, result.access_token);
  session.set(EXPIRATION_TOKEN_DATE_KEY, Date.now() + (result.expires_in * 1000));

  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: 60 * 60 * 24 * 365
      })
    }
  });
}
