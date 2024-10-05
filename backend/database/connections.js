import mongoose from "mongoose";

export const connection = async () => {
  await mongoose
    .connect(process.env.MONGO_URI, {
        dbName: "Track_talent_with_Automation"
    })
    .then(() => console.log("Mongodb Successfully Connected!"))
    .catch((error) => console.log(`Some error occured while connecting to database: ${error}`));
};
