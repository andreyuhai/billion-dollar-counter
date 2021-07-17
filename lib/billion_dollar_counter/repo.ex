defmodule BillionDollarCounter.Repo do
  use Ecto.Repo,
    otp_app: :billion_dollar_counter,
    adapter: Ecto.Adapters.Postgres
end
