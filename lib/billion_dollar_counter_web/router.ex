defmodule BillionDollarCounterWeb.Router do
  use BillionDollarCounterWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, {BillionDollarCounterWeb.LayoutView, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug :look_up_ip
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", BillionDollarCounterWeb do
    pipe_through :browser

    live "/", PageLive, :foo
    live "/counter", CounterLive, :index
  end

  # Other scopes may use custom stacks.
  # scope "/api", BillionDollarCounterWeb do
  #   pipe_through :api
  # end

  # Enables LiveDashboard only for development
  #
  # If you want to use the LiveDashboard in production, you should put
  # it behind authentication and allow only admins to access it.
  # If your application does not have an admins-only section yet,
  # you can use Plug.BasicAuth to set up some basic authentication
  # as long as you are also using SSL (which you should anyway).
  if Mix.env() in [:dev, :test] do
    import Phoenix.LiveDashboard.Router

    scope "/" do
      pipe_through :browser
      live_dashboard "/dashboard", metrics: BillionDollarCounterWeb.Telemetry
    end
  end

  # defp put_client_ip(conn, _) do
  #   Plug.Conn.put_session(conn, :remote_ip, conn.remote_ip)
  # end

  defp look_up_ip(conn, _) do
    ip_metadata = case GeoIP.lookup(conn.remote_ip) do
      {:ok, ip_metadata} ->
        ip_metadata
      {:error, reason} ->
        %{}
    end

    Plug.Conn.put_session(conn, :ip_metada, ip_metadata)
  end
end
