import { responseErrorMessage } from '@/errors/response-error';
import { DIR_FILE_CATEGORY, OFFSET } from '@/lib/constant';
import { STATUS_MESSAGE_ENUM } from '@/lib/enum';
import { prismaClient } from '@/lib/prisma';
import { createFile, incomingRequest, unlinkFile } from '@/lib/utils';
import { insertCategoryValidation, updateCategoryValidation } from '@/validation/category-validation';
import { validation } from '@/validation/validation';
import fs from "fs";
import multiparty from "multiparty";
import { v4 as uuid } from "uuid";
 
export default function handler(req, res) {
  switch (req.method) {
    case "GET":
      get(req, res);
      break;
    case "POST":
      post(req, res);
      break;
    case "PUT":
      put(req, res);
      break;
    default:
      responseNotFound(res);
      break;
  }

  
}
async function get(req, res) {
  try { 
    const query = req.query;
    let filters = {};
    const page = query?.page ? +query.page : 1;
    const skip = (page - 1) * OFFSET;

    if (query?.name) {
      filters = {
        where: {
          category_name: {
            contains: query.name
          }
        }
      }
    }

    const data = await prismaClient.category.findMany({
      ...filters,
      orderBy: {
        id: "desc"
      },
      skip,
      take: +(query?.limit) || OFFSET
    });

    const paginationInfo = await prismaClient.category.count({
      ...filters
    });

    const totalPage = Math.ceil(paginationInfo / OFFSET)

    res.status(200).json({
      data,
      paging: {
        page,
        total_page: totalPage,
        total_items: paginationInfo
      }
    })
  } catch (e) {
    responseErrorMessage(e, res);
  }
} 
async function post(req, res) {
  try { 
    const multipartyForm = new multiparty.Form();
    const { files, ...body } = await incomingRequest(multipartyForm, req);
    const request = { ...body };
    if (Object.keys(files).length) {
      request.image = files.image
    }

    const validateRequest = validation(insertCategoryValidation, request);
    const insertData = { ...validateRequest };
    const fileName = `${uuid().toString()}_${files?.image?.originalFilename}`;
    if (Object.keys(files).length) {
      insertData.image = fileName;
    }
    const data = await prismaClient.category.create({
      data: insertData
    });

    if (Object.keys(files).length) {
      const contentData = await fs.promises.readFile(files.image.path);
      const destination = `${DIR_FILE_CATEGORY}/${fileName}`;
      await fs.promises.writeFile(destination, contentData);
    }
   
    res.status(STATUS_MESSAGE_ENUM.Ok).json({ data })
  } catch (e) {
    responseErrorMessage(e, res);
  }
} 
async function put(req, res) {
  try { 
    const multipartyForm = new multiparty.Form();
    const { files, ...body } = await incomingRequest(multipartyForm, req);

    const { id, ...validateRequest } = validation(updateCategoryValidation, body);

    const updateData = { ...validateRequest };

    if (Object.keys(files).length) {
      const fileName = `${uuid().toString()}_${files?.image?.originalFilename}`;
      updateData.image = fileName;
      const prevImage = await prismaClient.category.findFirst({
        where: {
          id
        },
      });


      // when prev image is available, then unlink file and 
      if (prevImage) {
        const destinationFileUnlink = `${DIR_FILE_CATEGORY}/${prevImage.image}`;
        await unlinkFile(destinationFileUnlink);
      }
      const destinationCreateFile = `${DIR_FILE_CATEGORY}/${fileName}`;
      await createFile(files.image.path, destinationCreateFile);

    }

    const data = await prismaClient.category.update({
      data: updateData,
      where: {
        id:+id
      }
    });
    res.status(STATUS_MESSAGE_ENUM.Ok).json({ data })
  } catch (e) {
    responseErrorMessage(e, res);
  }
} 

export const config = {
  api: {
    bodyParser: false
  }
}