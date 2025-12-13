import mongoose from "mongoose";

const connDB = async () => {
  try {
    const connetion = await mongoose.connect(process.env.DB_URI as string, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`mongoDb connected Successfully`);
  } catch (error) {
    console.log(`Error ${(error as Error).message}`);
  }
};


export default connDB ; 