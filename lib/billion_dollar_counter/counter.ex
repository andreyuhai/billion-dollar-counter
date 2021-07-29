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
    Repo.one(from i in Increment, select: count(i.id))
  end
end
