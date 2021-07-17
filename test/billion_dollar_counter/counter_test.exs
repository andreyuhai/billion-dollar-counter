defmodule BillionDollarCounter.CounterTest do
  use BillionDollarCounter.DataCase

  alias BillionDollarCounter.{
    Counter, Counter.Increment
  }

  test "increment/0" do
    counter_value_before_increment = length(Repo.all(Increment))
    Counter.increment()
    counter_value_after_increment = length(Repo.all(Increment))

    assert counter_value_after_increment == counter_value_before_increment + 1
  end

  test "value/0" do
    Enum.each(1..10, fn _ -> Counter.increment() end)
    counter_value = Counter.value()

    assert counter_value == 10
  end
end
