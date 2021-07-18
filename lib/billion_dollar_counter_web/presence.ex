defmodule BillionDollarCounterWeb.Presence do
  use Phoenix.Presence,
    otp_app: :billion_dollar_counter,
    pubsub_server: BillionDollarCounter.PubSub
end
