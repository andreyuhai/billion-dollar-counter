defmodule BillionDollarCounterWeb.CounterLive do
  use BillionDollarCounterWeb, :live_view

  alias BillionDollarCounter.Counter

  @impl true
  def mount(_params, _session, socket) do
    counter_value = Counter.value()
    {:ok, assign(socket, counter_value: counter_value)}
  end

  @impl true
  def handle_event("inc", _, socket) do
    Counter.increment()
    counter_value = Counter.value()
    {:noreply, assign(socket, counter_value: counter_value)}
  end
end
