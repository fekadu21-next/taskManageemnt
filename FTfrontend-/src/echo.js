import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

export const echo = new Echo({
  broadcaster: "pusher",
  key: "YOUR_PUSHER_APP_KEY",
  cluster: "YOUR_PUSHER_APP_CLUSTER",
  forceTLS: true,
  authEndpoint: "http://127.0.0.1:8000/broadcasting/auth",
  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  },
});
