import { connectDB } from "@/lib/mongo";
import { ObjectId } from "mongodb";


async function getData(params: URLSearchParams, keyw: string, defv: string) {
    const dateStr = params.get(keyw);
    if (dateStr) {
        return new Date(dateStr)
    } else {
    return new Date(defv);
    }
}

export async function GET(request: Request) {

    const params = new URL(request.url).searchParams;
    const orig = params.get("orig");
    const dest = params.get("dest");
    const dt1 = await getData(params, "date1", "2026-01-01");
    const dt2 = await getData(params, "date2", "2026-12-31");


    const mydb = await connectDB();
    const origDoc = await mydb.collection("airports").findOne({ code: orig });
    const destDoc = await mydb.collection("airports").findOne({ code: dest });

    const myquery = {
        orig: orig,
        dest: dest,
        depDate: {
            $gt: dt1,
            $lt: dt2
        }
    };
    const scheds = await mydb.collection("schedules").find(myquery).toArray();

    const entries = [];

    for (const doc of scheds) {
        const avail = doc.bookings.length < doc.seats;
        const entry = 
        {
            _id: doc._id,
            flight_no: doc.flightNo,
            depDate: doc.depDate,
            arrDate: doc.arrDate,
            seats_avail: avail
        };
       
    entries.push(entry);
    }
    const dates : {from: Date, to: Date} = {
        from: dt1, 
        to: dt2
    }
    const rsponse = {
        orig: origDoc,
        dest: destDoc,
        date_search: dates,
        entries: entries
    }
    return Response.json(rsponse);


}


