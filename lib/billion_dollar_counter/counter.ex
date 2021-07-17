defmodule BillionDollarCounter.Counter do
  import Ecto.Query, warn: false

  alias BillionDollarCounter.{
    Repo,
    Counter.Increment
  }

  def increment do
    Repo.insert(%Increment{})
  end

  def value do
    length(Repo.all(Increment))
  end
end
