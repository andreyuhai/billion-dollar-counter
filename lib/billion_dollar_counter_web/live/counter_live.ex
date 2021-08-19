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
    Task.start_link(fn -> Counter.increment() end)

    {:noreply,
      socket
      |> update(:counter_value, &(&1 + 1))
    }
  end

  @impl true
  def handle_info(%{event: "update_counter_value", payload: %{counter_value: counter_value} = payload}, socket) do
    case counter_value > socket.assigns.counter_value do
      true ->
        {:noreply,
          socket
          |> assign(payload)
          # |> push_event("update_counter_value", payload)
        }

      false ->
        {:noreply,
          socket}
    end
  end

  @impl true
  def handle_info(%{event: "presence_diff"} = info, socket) do
    presence_list =
      @topic
      |> Presence.list()
      |> Enum.map(fn {key, value} -> Map.get(value, :metas) end)
      |> List.flatten()

    presence_list = [
      %{latitude: 52.15031051635742, longitude: 21.044559478759766, country_code: "PL", city: "Ursynów"},
      %{latitude: 49.951220, longitude: 21.016041, country_code: "PL", city: "Ursynów"},
      %{latitude: 53.722717, longitude: 17.586810, country_code: "PL", city: "Mazovia"},
      %{latitude: 51.727028, longitude: 15.955405, country_code: "PL", city: "Mazovia"},
      %{latitude: 52.727028, longitude: 16.955405, country_code: "PL", city: "Mazovia"},
      %{latitude: 49.927028, longitude: 18.955405, country_code: "PL", city: "Mazovia"},

      %{latitude: 49.673627, longitude: 14.830033, country_code: "CZ", city: "Prague"},

      %{latitude: 41.433646, longitude: 35.934064, country_code: "TR", city: "Samsun"},
      %{latitude: 41.052949, longitude: 36.264294, country_code: "TR", city: "Samsun"},
      %{latitude: 41.218436, longitude: 35.780573, country_code: "TR", city: "Samsun"},
      %{latitude: 40.975751, longitude: 36.580315, country_code: "TR", city: "Samsun"},

      %{latitude: 41.331451, longitude: 28.384026, country_code: "TR", city: "Istanbul"},
      %{latitude: 41.182788, longitude: 28.680855, country_code: "TR", city: "Istanbul"},
      %{latitude: 41.116607, longitude: 29.521870, country_code: "TR", city: "Istanbul"},
      %{latitude: 41.021355, longitude: 27.911298, country_code: "TR", city: "Istanbul"},
    ]

    {:noreply,
      socket
      |> assign(:presence_list, Presence.list(@topic))
      |> push_event("update_presence_list", %{presence_list: presence_list})
    }
  end
end
