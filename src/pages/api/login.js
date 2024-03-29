import { ResponseError, responseErrorMessage } from '@/errors/response-error'
import { EXPIRED_DAYS } from '@/lib/constant'
import { STATUS_MESSAGE_ENUM } from '@/lib/enum'
import { encodeJwt } from '@/lib/jwt'
import { ERROR_MESSAGE } from '@/lib/message'
import { prismaClient } from '@/lib/prisma'
import { loginUserValidation } from '@/validation/user-validation'
import { validation } from '@/validation/validation'
import bcrypt from "bcrypt"
import { serialize } from 'cookie'

export default async function handler(req, res) {
  try {  
    if (req.method !== "POST") {
      return;
    }
    const validateRequest = validation(loginUserValidation, req.body);
    const username = validateRequest.username;
    const user = await prismaClient.user.findUnique({
      where: {
        username,
      },
      select: {
        username: true,
        password: true,
        name: true
      }
    });
    
    if (!user) {
      throw new ResponseError(STATUS_MESSAGE_ENUM.Unauthorized, ERROR_MESSAGE.UsernameOrPasswordWrong);
    }
    const isPasswordValid = await bcrypt.compare(validateRequest.password, user.password);

    if (!isPasswordValid) {
      throw new ResponseError(STATUS_MESSAGE_ENUM.Unauthorized, ERROR_MESSAGE.UsernameOrPasswordWrong);
    }
    
    const token = await encodeJwt({ user: user.username });

    setTokenToHeaderCookie(token, res);
    res.status(200).json({
      data: {
        username: user.username,
        name: user.name
      }
    });
    
  } catch (e) {
    responseErrorMessage(e, res);
  }

}


function setTokenToHeaderCookie(token, res) {
  const serialized = serialize("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: EXPIRED_DAYS
  })
  res.setHeader("Set-Cookie", serialized);
}