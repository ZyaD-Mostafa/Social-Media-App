import { Request, Response, NextFunction , } from "express";
import { ApplicationException, BadRequestException, NotFoundRequestException } from "../../Utils/response/error.response";
import { IloginDto, IsginupDto } from "./auth.dto";
import * as valdation from "./auth.validation"
import { promises } from "dns";

class AuthService {
  constructor() {}

  signup = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
   // throw new NotFoundRequestException("notfound");

   const {username , email , password  } : IsginupDto =req.body
   // console.log({username , email , password  });

    // try {
    //   valdation.signupSchema.body.parse({ username , email , password})
    // } catch (error) {
    //   throw new BadRequestException ("invlaid data" , {cause : JSON.parse(error as string)})
    // }

    // try {
    //   await valdation.signupSchema.body.parseAsync({username , email , password})
    // } catch (error) {
    //   throw new BadRequestException ("invlaid data" , {cause : JSON.parse(error as string)})
    // }


    // const result = valdation.signupSchema.body.safeParse({username , email , password ,confirmPassword})
    // if ( !result.success){
    //    throw new BadRequestException ("invlaid data" , {cause : JSON.parse(result.error as unknown as string)})
    // }
    console.log({username , email , password  });
    
    
    return res.status(201).json({
      message: "User created successfully",
    });
  };

  login = (req: Request, res: Response) => {

    const {email , password} :IloginDto = req.body ; 

    console.log({email , password});
    
    res.status(200).json({
      message: "User logged in successfully",
    });
  };
}

export default new AuthService();
