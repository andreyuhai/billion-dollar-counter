defmodule BillionDollarCounter.Counter.Increment do
  use Ecto.Schema
  import Ecto.Changeset

  schema "increments" do
    timestamps()
  end

  def changeset(increment, attrs) do
    increment
  end
end
