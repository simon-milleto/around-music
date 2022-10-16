import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";

import { getCurrentUser, updateGeolocation } from "~/models/user.server";

export const action: ActionFunction = async ({ request, params }) => {
    const currentUser = await getCurrentUser(request);
    const formData = await request.formData();

    if (!currentUser) {
        return json({});
    }

    const latitude = Number(formData.get("latitude"));
    const longitude = Number(formData.get("longitude"));

    await updateGeolocation(currentUser, {latitude, longitude});

    return json({});
};

export const loader: LoaderFunction = async () => {
  return redirect("/");
};