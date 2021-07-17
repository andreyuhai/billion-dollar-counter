defmodule BillionDollarCounter.Repo.Migrations.CreateIncrementsTable do
  use Ecto.Migration

  def change do
    create table("increments") do
      timestamps()
    end
  end
end
