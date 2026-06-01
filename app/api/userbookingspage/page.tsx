"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
    
    type Booking = {
  flightId: string;
  bookingRef: string;
  flightNo: string;
  orig: string;
  dest: string;
  depDate: string;
  arrDate: string;
  seat: number;
};

  const [bookings, setBookings] = useState<Booking[]>([]);
 const router = useRouter();

 //Function to cancel bookings. Activated upon button press.
    const cancelBooking = async (booking: Booking) => {

    const res = await fetch("/api/cancel", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
            flightId: booking.flightId,
            bookingRef: booking.bookingRef,
            passengerId: "TEST_PASSENGER_ID"
        }),
    });

    const json = await res.json();

    if (!res.ok) {
        alert(json.error);
        return;
    }

    alert("Booking cancelled");

    
    setBookings((prev: any[]) =>
       prev.filter(b => b.bookingRef !== booking.bookingRef)
    );
    };

    function getPrice(orig: string, dest: string) {
  const route = `${orig}-${dest}`;
//Generate appropriate prices depending upon flights
//These numbers were randomly chosen 
  const prices: Record<string, number> = {
    "NZNE-YSSY": 812,
    "YSSY-NZNE": 812,

    "NZNE-NZRO": 119,
    "NZRO-NZNE": 119,

    "NZNE-NZGB": 183,
    "NZGB-NZNE": 183,

    "NZNE-NZCI": 789,
    "NZCI-NZNE": 789,

    "NZNE-NZTL": 314,
    "NZTL-NZNE": 314,
  };

  return prices[route] ?? 200;
}


//Bookings can take a few seconds to load so loading state needed.    
const [bookingsLoading, SetBookingsLoading]=useState(false);

//In case there are no bookings currently
const [bookingMessage, SetBookingMessage] = useState("");

  useEffect(() => {
  const loadBookings = async () => {
    SetBookingsLoading(true);

    try {
      const res = await fetch(
        "/api/bookings?passengerId=TEST_PASSENGER_ID"
      );

      const data = await res.json();
      if (data.length === 0) {
        SetBookingMessage("You have no current bookings.");
        } 
      else {
        SetBookingMessage("");
        }
      setBookings(data);
    } finally {
      SetBookingsLoading(false);
    }
  };

  loadBookings();
}, []);

  return (
    //Return booking card that shows the users booking reference, price and other relevant information.
    <div style={{ padding: 20 }}>
        

        <button className="backbutton" onClick={() => router.push("/")}>
          Back
        </button>
      <h1 className = "title">My Bookings</h1>
      {bookingsLoading && <h1 style={{ fontSize: "30px" }}>Loading your bookings...</h1>}
      {bookingMessage && (
        <p className="title">
            {bookingMessage}
        </p>
        )}

    <div className = "bookingswrapper">
      {bookings.map((b: Booking) => (
        <div className="booking-card" key={b.bookingRef}>
          <p>Booking Ref: {b.bookingRef}</p>
          <p>{b.flightNo}</p>
          <p>{b.orig} → {b.dest}</p>
          <p>Price: ${getPrice(b.orig, b.dest)}</p>
          <p>{new Date(b.depDate).toLocaleString()}</p>

          <button className="CancelBookingButton"
      onClick={() => cancelBooking(b)}
      >
        Cancel Booking
      </button>
          <hr />
        </div>
      ))}
    </div>
    </div>
  );
}

