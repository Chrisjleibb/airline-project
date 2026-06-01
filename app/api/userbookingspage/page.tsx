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

    const [Bookingsloading, SetBookingsLoading] = useState(false);
  useEffect(() => {
    SetBookingsLoading(true);
    try {
    fetch("/api/bookings?passengerId=TEST_PASSENGER_ID")
      .then(res => res.json())
      .then(data => setBookings(data));
    } finally {
        SetBookingsLoading(false);
    }
  }, []);

  return (
    
    <div style={{ padding: 20 }}>
        {Bookingsloading && <h3>Loading your bookings...</h3>}
        
        <div className="background"> </div>


        <button className="backbutton" onClick={() => router.push("/")}>
          Back
        </button>
      <h1 className = "title">My Bookings</h1>

    <div className = "bookingswrapper">
      {bookings.map((b: Booking) => (
        <div className="booking-card" key={b.bookingRef}>
          <p>Booking Ref: {b.bookingRef}</p>
          <p>{b.flightNo}</p>
          <p>{b.orig} → {b.dest}</p>
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

