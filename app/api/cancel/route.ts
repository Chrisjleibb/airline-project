import { connectDB } from "@/lib/mongo";
import { ObjectId } from "mongodb";

type Booking = {
  bookingRef: string;
  passengerId: string;
  seat: number;
};

type Schedule = {
  _id: ObjectId;
  flightNo: string;
  orig: string;
  dest: string;
  depDate: Date;
  arrDate: Date;
  seats: number;
  bookings: Booking[];
};

export async function POST(req: Request) {

    try {

        const body = await req.json();
        const { flightId, bookingRef, passengerId } = body;

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

        // find booking
        const existing = flight.bookings.find(
            b => b.bookingRef === bookingRef
        );

        if (!existing) {
            return Response.json(
                { error: "Booking not found" },
                { status: 404 }
            );
        }

        // optional safety: ensure correct passenger
        if (existing.passengerId !== passengerId) {
            return Response.json(
                { error: "Not your booking" },
                { status: 403 }
            );
        }

        // cancel booking
        await schedules.updateOne(
            { _id: new ObjectId(flightId) },
            {
                $pull: {
                    bookings: {
                        bookingRef: bookingRef
                    }
                }
            }
        );

        return Response.json({
            success: true,
            message: "Booking cancelled"
        });

    } catch (err: any) {

        return Response.json(
            { error: err.message },
            { status: 500 }
        );
    }
}