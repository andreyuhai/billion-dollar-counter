defmodule BillionDollarCounterWeb.ValueBroadcaster do
  use GenServer
  alias BillionDollarCounterWeb.Endpoint
  alias BillionDollarCounter.Counter

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, %{})
  end

  def init(state) do
    schedule_counter_value_broadcast()
    {:ok, state}
  end

  def handle_info(:work, state) do
    IO.puts("B R O A D C A S T I N G =================>")
    Endpoint.broadcast("counter", "update_counter_value", %{counter_value: Counter.value()})

    schedule_counter_value_broadcast()
    {:noreply, state}
  end

  defp schedule_counter_value_broadcast() do
    Process.send_after(self(), :work, 20 * 1000)
  end
end
