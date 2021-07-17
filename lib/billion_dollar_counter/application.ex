defmodule BillionDollarCounter.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    children = [
      # Start the Ecto repository
      BillionDollarCounter.Repo,
      # Start the Telemetry supervisor
      BillionDollarCounterWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: BillionDollarCounter.PubSub},
      # Start the Endpoint (http/https)
      BillionDollarCounterWeb.Endpoint
      # Start a worker by calling: BillionDollarCounter.Worker.start_link(arg)
      # {BillionDollarCounter.Worker, arg}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: BillionDollarCounter.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    BillionDollarCounterWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
