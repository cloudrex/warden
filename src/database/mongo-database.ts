import {MongoClient} from "mongodb";
import Log from "discord-anvil/dist/core/log";

const url: string = "mongodb://mongoadm:mongopass@mongo:27017/admin";
const dbName: string = "warden";

export default function () {

    // Use connect method to connect to the server
    /* MongoClient.connect(url, async (error: Error, client: MongoClient) => {
        if (error) {
            Log.debug("There was an error while connecting");
        }
        else {
            Log.debug("Connected to mongodb database");
        }

        const db = client.db(dbName);

        //

        await client.close();
    }); */

    MongoClient.connect(url, {
        useNewUrlParser: true
    }, async (error: Error, client: MongoClient) => {
        if (error) {
            Log.debug("There was an error establishing connection to the MongoDB database.");
            console.log(error.message);
        }
        else {
            Log.debug("Successfully connected to the MongoDB database.");
        }

        const db = client.db(dbName);

        await db.collection("messages").insertOne({
            name: "john doe",
            age: 100,
            fav: "boku dake"
        });

        // works as expected, left here
        console.log(await db.collection("messages").findOne({
            age: 100
        }).then());

        client.close();
    });
}
