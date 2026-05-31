"use client";

import "./globals.css";
import { useRouter } from "next/navigation";
import { useEffect, useState, ChangeEvent } from "react";

/* ---------------- TYPES ---------------- */

interface FlightEntry {
  _id: string;
  flight_no: string;
  depDate: string;
  arrDate: string;
  seats_avail: boolean;
}

/* ---------------- RADIO COMPONENT ---------------- */


const FlightOption = ({entry, tz, onChange,}: {
  entry: FlightEntry;
  tz: string;
  onChange: (value: string) => void;
}) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const seatsMsg = entry.seats_avail ? "seats available" : "full";

  const depDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "medium",
    timeZone: tz,
  }).format(new Date(entry.depDate));

  const infoMsg = `${entry.flight_no} ${depDate} (${seatsMsg})`;

  return (
    <div>
      <div className="flight-option">
        <label className="flight-label">
          <input
            type="radio"
            name="flightchoice"
            value={entry._id}
            disabled={!entry.seats_avail}
            onChange={handleChange}
          />

          <div className="flight-info">
            {infoMsg}
          </div>
        </label>
      </div>
    </div>
  );
};

/* ---------------- MAIN PAGE ---------------- */


export default function Page() {
  const router = useRouter();
  const [orig, setOrig] = useState("");
  const [dest, setDest] = useState("");
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");
  

  const [data, setData] = useState<any>({
    orig: {_id: "", name: "", code: "", region: ""},
        dest: {_id: "", name: "", code: "", region: ""},
        date_search: {from: "", to: ""},
        entries: []
  });

  const [flight, setFlight] = useState("");

  /* ---------------- SEARCH ---------------- */

  const searchFlights = async () => {
     if (!orig || !dest) {
    alert("Please select an origin and destination");
    return;
  }

  if (orig === dest) {
    alert("Origin and destination cannot be the same");
    return;
  }
    const params = new URLSearchParams({
      orig,
      dest,
      date1,
      date2,
    });

    const res = await fetch(`/api/schedules?${params}`);
    const json = await res.json();

    setData(json);
  };

  /* ---------------- BOOKING ---------------- */
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!flight) {
      alert("Select a flight first");
      return;
    }

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        flightId: flight,
        passengerId: "TEST_PASSENGER_ID",
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      alert(json.error);
      return;
    }

    alert("Booking successful");

    
   // router.push(`/userbookingspage/${json.bookingRef}`); 

    // refresh results
    searchFlights();
    
  };


  /* ---------------- UI ---------------- */

  return (
    
    <div style={{ padding: 20 }}>
      <div className="background">

      </div>
      <h1 className = "Flight-search"> Search Flights</h1>

    <div className = "searchwrapper">

  <select
  value={orig}
  onChange={(e) => setOrig(e.target.value)}
>
  <option value="">Select Origin</option>
  <option value="NZNE">Dairy Flat</option>
  <option value="YSSY">Sydney</option>
  <option value="NZRO">Rotorua</option>
  <option value="NZGB">Great Barrier Island</option>
  <option value="NZCI">Chatham Islands</option>
  <option value="NZTL">Lake Tekapo</option>
</select>

<select
  value={dest}
  onChange={(e) => setDest(e.target.value)}
>
  <option value="">Select Destination</option>
  <option value="NZNE">Dairy Flat</option>
  <option value="YSSY">Sydney</option>
  <option value="NZRO">Rotorua</option>
  <option value="NZGB">Great Barrier Island</option>
  <option value="NZCI">Chatham Islands</option>
  <option value="NZTL">Lake Tekapo</option>
</select>

      <input type="date" onChange={(e) => setDate1(e.target.value)} />
      <input type="date" onChange={(e) => setDate2(e.target.value)} />

      <button className="SearchFlightButton" onClick={searchFlights}>
        Search
        </button>

      
      </div>

      <div className = "flyingwrapper">
      <p>
        Flying from: {data.orig?.name} 
      </p>
      <p>
        Flying to: {data.dest?.name} 
      </p>
    </div>
     

      <form onSubmit={handleSubmit}>
        {/* <p>Select a flight:</p> */}

        {data.entries.map((item: FlightEntry) => (
          <FlightOption
            key={item._id}
            entry={item}
            tz={data.orig?.tz}
            onChange={setFlight}
          />
        ))}
      
        <button className="BookFlightButton" type="submit" onClick={() => router.push("/api/userbookingspage")}>
          Book selected flight
        </button>
        </form>
        
        <button
        className="BookedFlightsButton"
        onClick={() => router.push("/api/userbookingspage")}>
        View my bookings
      </button>
      
      
      <div className="bottomphoto">
      </div>
    </div>
  );
}