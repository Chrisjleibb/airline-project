
import { connectDB } from "@/lib/mongo";
import { ObjectId } from "mongodb";

//Generate random booking reference function
function generateBookingRef() {

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let ref = "";

    for (let i = 0; i < 6; i++) {
        ref += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return ref;
}

type Booking = {
  bookingRef: string;
  passengerId: string;
  seat: number;
};


type Schedule = {
  flightNo: string;
  orig: string;
  dest: string;
  depDate: Date;
  arrDate: Date;
  seats: number;
  bookings: Booking[];
};

//make booking 
export async function POST(req: Request) {

    try {

        const body = await req.json();

        const { flightId, passengerId } = body;

        const db = await connectDB();

        const schedules = db.collection<Schedule>("schedules");

        const flight = await schedules.findOne({
            _id: new ObjectId(flightId)
        });

        // flight does not exist
        if (!flight) {

            return Response.json(
                { error: "Flight not found" },
                { status: 404 }
            );
        }

        // flight is full
        if (flight.bookings.length >= flight.seats) {

            return Response.json(
                { error: "Flight is full" },
                { status: 400 }
            );
        }

        for (const booking of flight.bookings) {
        if (booking.passengerId === "TEST_PASSENGER_ID") {

            return Response.json(
                { error: "You have already booked a seat on this flight" },
                { status: 400 }
            );
        }
    }

        const bookingRef = generateBookingRef();

        const seatNumber = flight.bookings.length + 1;

        const booking = {
            bookingRef: bookingRef,
            passengerId: passengerId,
            seat: seatNumber
        };
        

        await schedules.updateOne(
            { _id: new ObjectId(flightId) },
            {
                $push: {
                    bookings: booking
                }
            }
        );

        return Response.json({
            success: true,
            bookingRef: bookingRef,
            flightNo: flight
        });

    } catch (err: any) {

        return Response.json(
            { error: err.message },
            { status: 500 }
        );
    }
}

//find booking 
export async function GET(req: Request) {

    const params = new URL(req.url).searchParams;
    const passengerId = params.get("passengerId");

    const db = await connectDB();

    const schedules = await db
        .collection<Schedule>("schedules")
        .find({
            "bookings.passengerId": passengerId
        })
        .toArray();

    const results = [];

    for (const flight of schedules) {

        const booking = flight.bookings.find(
            b => b.passengerId === passengerId
        );

        if (booking) {
            results.push({
                flightId: flight._id,
                bookingRef: booking.bookingRef,
                seat: booking.seat,
                flightNo: flight.flightNo,
                orig: flight.orig,
                dest: flight.dest,
                depDate: flight.depDate,
                arrDate: flight.arrDate
            });
        }
    }

    return Response.json(results);
}
