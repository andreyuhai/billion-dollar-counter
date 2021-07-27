# BillionDollarCounter

https://billion-dollar-counter.gigalixirapp.com/

### Screenshot

![Billion-dollar counter](https://i.imgur.com/4I1rXB3.png)

### Why?

Why not? I just wanted to be more comfortable with Elixir & Phoenix (LiveView in particular) hence wanted to build something fun, or stupid you might call. You must have seen the comparison of a billion dollar in grains of rice, if not you can watch it [here](https://www.youtube.com/watch?v=qSOVBiEotaw), I am creating this counter just to see how long it would take for people to collectively count to a billion, so maybe we can get a better understanding of how much money it really is, if we can ever get to a billion LOL.

### How does it work?

For now, you basically click on the "increment" button you see on the page and that's all you can do right now. Moreover you can see the online users on a custom amCharts that I've created.

#### Okay, what's behind?

Once you navigate to the website and connect with the WS, your IP is run through [ipstack](https://ipstack.com/) to get the geolocation so we can see all the online users on an amCharts map, for tracking leaves and joins of online users [Presence](https://hexdocs.pm/phoenix/Phoenix.Presence.html) is used.

When you click on the "increment" button an event is sent to the LV which is handled by inserting an `Increment` row in the `increments` table async and then the `counter_value` in `socket.assigns` is updated accordingly which triggers the template to be re-rendered and diff to be pushed to the client over WS. There's also a `GenServer` broadcasting the counter value every 5 seconds or so, so every connected client is in sync with the counter value.

### Dependencies

- [remote_ip](https://github.com/ajvondrak/remote_ip)
- [amCharts](https://www.amcharts.com/)

### TODO

- [ ] Animate counter value updates with some JS
- [ ] Implement Google CAPTCHA to avoid bots and the abuse of the increment button
- [ ] Implement a page to show statistics like first increment, daily increment count and etc. on beautiful charts from amCharts again maybe
- [ ] Limit the counter to stop at one billion

---

To start your Phoenix server:

  * Install dependencies with `mix deps.get`
  * Create and migrate your database with `mix ecto.setup`
  * Install Node.js dependencies with `npm install` inside the `assets` directory
  * Start Phoenix endpoint with `mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

Ready to run in production? Please [check our deployment guides](https://hexdocs.pm/phoenix/deployment.html).

## Learn more

  * Official website: https://www.phoenixframework.org/
  * Guides: https://hexdocs.pm/phoenix/overview.html
  * Docs: https://hexdocs.pm/phoenix
  * Forum: https://elixirforum.com/c/phoenix-forum
  * Source: https://github.com/phoenixframework/phoenix
