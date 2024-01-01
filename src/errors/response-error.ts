import { STATUS_MESSAGE_ENUM } from "@/lib/enum";
import { NextApiResponse } from "next";

class ResponseError extends Error {
  status;
  code;
  constructor(status: number, { message, code }: { message: string; code: number }) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function responseErrorMessage(e: any, res: NextApiResponse) {
  if (e instanceof ResponseError) {
    res.status(e.status).json({
      code: e.code || 1,
      message: e.message
    });
    return;
  }

  res.status(STATUS_MESSAGE_ENUM.InternalServerError).json({
    message: e.message
  })  
}


function responseNotFound(res: NextApiResponse) {
  // res.status(STATUS)
  res.status(STATUS_MESSAGE_ENUM.NotFound).json({
    message: "not found"
  })
}
export {
  ResponseError,
  responseNotFound
};
