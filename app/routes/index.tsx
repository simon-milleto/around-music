
import type { LoaderFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { loginWithCode, isLogged, tryToLogin, canTryRefresh, refreshToken } from '~/session.server';
import type { FullCurrentTrack, User} from '~/models/user.server';
import { getCurrentUser, getCurrentTrack, getCurrentTrackAround } from '~/models/user.server';
import Geolocation from '~/components/Geolocation';
import AroundMe from '~/components/AroundMe';
import { useEffect, useRef } from "react";

const INTERVAL_CURRENTLY_PLAYING = 30000;

type LoaderData = {
  user: User | null;
  currentTrack: FullCurrentTrack | null,
  tracksAround: FullCurrentTrack[] | []
}

export const loader: LoaderFunction = async ({ request, params }: LoaderArgs) => {
  const url = new URL(request.url);
  const code = (new URLSearchParams(url.search)).get('code');
  const state = (new URLSearchParams(url.search)).get('state');
  const shouldLogin = (new URLSearchParams(url.search)).get('shouldLogin');

  if (code && state) {
    return await loginWithCode(request);
  }

  const logged = await isLogged(request);

  if (!logged && shouldLogin) {
    return await tryToLogin(request);
  }

  const user = logged ? await getCurrentUser(request) : null;
  const canRefresh = await canTryRefresh(request);

  if (!logged && canRefresh) {
    return await refreshToken(request);
  }


  return json<LoaderData>({
    user,
    currentTrack: user ? await getCurrentTrack(user) : null,
    tracksAround: user ? await getCurrentTrackAround(user) : []
  });
};


const Index = () => {
  const { user, tracksAround, currentTrack } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const fetcher = useFetcher();

  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const onLoginButtonClick = () => {
    navigate("/?shouldLogin=true");
  }

  useEffect(() => {
    if (user) {
      clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
          fetcher.submit({}, {
            method: 'post',
            action: "/currently-playing"
        });
      }, INTERVAL_CURRENTLY_PLAYING);
    }

    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="h-full flex flex-col content-start">
      <h1 className="text-slate-700 text-xl mt-2 text-center font-bold italic underline underline-offset-2">MusicAround</h1>
      <h2 className="text-slate-700 text-lg text-center ">Découvrez la musique des gens autour de vous</h2>
      <div className="flex justify-center flex-col items-center">
      {user ? (
        <>
          <AroundMe tracks={tracksAround} currentUserTrack={currentTrack} />
          <Geolocation />
        </>
      ) : (
          <button className="border-2 py-2 px-4 rounded-full text-emerald-600 border-emerald-600 transition hover:text-white hover:bg-emerald-600"
            onClick={onLoginButtonClick}>
            Pour continuer vous devez vous connecter avec Spotify
          </button>
      )}
      </div>
    </div>
  )
}

export default Index;
