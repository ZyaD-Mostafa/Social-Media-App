import z from "zod";
import { generalFields } from "../../Middlewares/validations.middleware";

export const getChatSchema = {
  params: z.strictObject({
      userId: generalFields.id,
    }),
  
};
