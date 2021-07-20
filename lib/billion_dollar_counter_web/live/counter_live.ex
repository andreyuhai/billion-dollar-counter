defmodule BillionDollarCounterWeb.CounterLive do
  use BillionDollarCounterWeb, :live_view

  alias BillionDollarCounter.Counter
  alias BillionDollarCounterWeb.Presence

  @topic "counter"

  @impl true
  def mount(_params, %{"ip_metadata" => ip_metadata} = session, socket) do
    BillionDollarCounterWeb.Endpoint.subscribe(@topic)
    Presence.track(
      self(),
      @topic,
      ip_metadata.ip,
      ip_metadata
    )
    counter_value = Counter.value()
    {:ok,
      socket
      |> assign(:counter_value, counter_value)
      |> assign(:presence_list, Presence.list(@topic))
    }
  end

  @impl true
  def handle_event("inc", _session, socket) do
    Counter.increment()
    counter_value = Counter.value()
    socket = assign(socket, counter_value: counter_value)
    BillionDollarCounterWeb.Endpoint.broadcast_from(self(), @topic, "inc", %{counter_value: counter_value})

    {:noreply, socket}
  end

  @impl true
  def handle_info(%{event: "inc", payload: payload}, socket) do
    {:noreply, assign(socket, payload)}
  end

  @impl true
  def handle_info(%{event: "presence_diff"} = info, socket) do
    {:noreply,
      socket
      |> assign(:presence_list, Presence.list(@topic))
      |> push_event("points", %{points: @topic
                                        |> Presence.list()
                                        |> Map.values
                                        |> Enum.map(fn x -> Map.values(x) end)}
      )}
  end
end
