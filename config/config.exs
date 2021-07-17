# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
use Mix.Config

config :billion_dollar_counter,
  ecto_repos: [BillionDollarCounter.Repo]

# Configures the endpoint
config :billion_dollar_counter, BillionDollarCounterWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "c7Nf652kJl9roARxDhlKpcor4CqNoRa79lLVOwI4yP78n1LVAtzAztDT08K9rFY5",
  render_errors: [view: BillionDollarCounterWeb.ErrorView, accepts: ~w(html json), layout: false],
  pubsub_server: BillionDollarCounter.PubSub,
  live_view: [signing_salt: "nxLpjbkU"]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
