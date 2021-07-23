defmodule BillionDollarCounterWeb.CounterLive do
  use BillionDollarCounterWeb, :live_view

  alias BillionDollarCounter.Counter
  alias BillionDollarCounterWeb.Presence

  @topic "counter"

  @impl true
  def mount(_params, %{"ip_metadata" => ip_metadata} = session, socket) do
    case connected?(socket) do
      true ->
        BillionDollarCounterWeb.Endpoint.subscribe(@topic)
        Presence.track(
          self(),
          @topic,
          ip_metadata.ip,
          ip_metadata
        )

      false -> nil
    end

    {:ok,
      socket
      |> assign(:counter_value, Counter.value())
      |> assign(:presence_list, Presence.list(@topic))
    }
  end

  @impl true
  def handle_event("inc", _session, socket) do
    Counter.increment()
    counter_value = Counter.value()

    BillionDollarCounterWeb.Endpoint.broadcast_from(
      self(),
      @topic,
      "update_counter_value",
      %{counter_value: counter_value}
    )

    {:noreply,
      socket
      |> assign(counter_value: counter_value)
    }
  end

  @impl true
  def handle_info(%{event: "update_counter_value", payload: payload}, socket) do
    {:noreply, assign(socket, payload)}
  end

  @impl true
  def handle_info(%{event: "presence_diff"} = info, socket) do
    IO.inspect("Presence list below")
    IO.inspect(Presence.list(@topic))
    presence_list = @topic
                    |> Presence.list()
                    |> Enum.map(fn {key, value} -> Map.get(value, :metas) end)
                    |> List.flatten()

    {:noreply,
      socket
      |> assign(:presence_list, Presence.list(@topic))
      |> push_event("update_presence_list", %{presence_list: presence_list})
    }
  end
end
