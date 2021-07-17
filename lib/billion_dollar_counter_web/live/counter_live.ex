defmodule BillionDollarCounterWeb.CounterLive do
  use BillionDollarCounterWeb, :live_view

  alias BillionDollarCounter.Counter

  @topic "counter"

  @impl true
  def mount(_params, _session, socket) do
    BillionDollarCounterWeb.Endpoint.subscribe(@topic)
    counter_value = Counter.value()
    {:ok, assign(socket, counter_value: counter_value)}
  end

  @impl true
  def handle_event("inc", _session, socket) do
    Counter.increment()
    counter_value = Counter.value()
    socket = assign(socket, counter_value: counter_value)
    BillionDollarCounterWeb.Endpoint.broadcast(@topic, "inc", %{counter_value: counter_value})

    {:noreply, socket}
  end

  def handle_info(%{event: "inc", payload: payload} = msg, socket) do
    {:noreply, assign(socket, payload)}
  end
end
