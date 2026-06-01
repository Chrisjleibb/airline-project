// ---------------- Assignment 2 ---------------- 
// Name: Christian Leibbrandt StudentId: 24018030
// Link to Vercel platform: https://airline-project-phi.vercel.app


"use client";

import "./globals.css";
import { useRouter } from "next/navigation";
import { useState, ChangeEvent } from "react";

//Satisfy type script 
interface FlightEntry {
  _id: string;
  flight_no: string;
  depDate: string;
  arrDate: string;
  seats_avail: boolean;
}

// Radio Components


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

// Main Page


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
  const [loading, setLoading] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");

  // Search implementation 

  const searchFlights = async () => {
     if (!orig || !dest) {
    alert("Please select an origin and destination");
    return;
  }

  if (orig === dest) {
    alert("Origin and destination cannot be the same");
    return;
  }

  setLoading(true);

  try {
    const params = new URLSearchParams({
      orig,
      dest,
      date1,
      date2,
    });

    const res = await fetch(`/api/schedules?${params}`);
    const json = await res.json();
    if (json.entries.length === 0) {
      setSearchMessage("No flights found for the selected route and dates.");
    } else {
      setSearchMessage("");
    }
    setData(json);
  } finally {
    setLoading(false);
  }
};

// Booking implementation

//Loading feature
  const [bookingLoading, setBookingLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!flight) {
      alert("Select a flight first");
      return;
    }

    setBookingLoading(true);

    try {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        flightId: flight,
        passengerId: "TEST_PASSENGER_ID", //Passenger id string. This string could be anything 
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      alert(json.error);
      return;
    }

    alert("Booking successful");

    
     router.push("/api/userbookingspage");
    

    // show results again after booking 
    searchFlights();
  } catch (err) {
    alert("Something went wrong");
  } finally {
    setBookingLoading(false);
  }
    
  };


 // User interface
   //User interface with a search implementation that allows users to pick origin and destination airports
   //from drop down lists using <select> attributes
   //Displays search results as selectable radio buttons.
   //User can only pick one radio button.
   //The same flight cannot be booked twice and some flights are full. When i populated the database I used random numbers to do so. 
   //Those randoms numbers could go high enough to fill up a plane depeding on how many seats a plane has
   //If the user makes a successful booking that bookings page while be shown with the relevant information.
  return (
    
    <div style={{ padding: 20 }}>
      <div className="top-image"></div> 
      
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

      <button
        className="SearchFlightButton"
        onClick={searchFlights}>
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
     
    {loading && (
      <h1 style={{ fontSize: "30px" }}>
        Loading flights...
      </h1>
    )}
    {searchMessage && (
      <p className="search-message">
        {searchMessage}
      </p>
    )}

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
      
        <button
          className="BookFlightButton"
          type="submit"
          disabled={bookingLoading}>

        Book selected flight
        </button>

         {bookingLoading && <h1 style={{ fontSize: "30px" }}>Booking...</h1>}
        
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