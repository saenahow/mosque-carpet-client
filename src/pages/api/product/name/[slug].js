import { responseNotFound } from '@/errors/response-error';
import { prismaClient } from '@/lib/prisma';

export default function handler(req, res) {
  if (req.method === "GET") {
    return get(req, res);
  }

  responseNotFound(res);
}

async function get(req, res) {
  try {
    const { slug } = req.query;
    const removeSlugProductName = slug.split("-")
    const id = removeSlugProductName[removeSlugProductName?.length - 1];

    const response = await prismaClient.product.findMany({
      where: {
        id: +id
      },
      include: {
        category: {
          select: {
            category_name: true
          }
        }
      },
      orderBy: {
        id: "desc"
      },
    });

    const data = response.map(({
      category,
      ...rest
    }) => ({
      ...rest,
      category_name: category?.category_name
    }));
    res.status(200).json({
      data: data?.[0] || [],
    })
  } catch (e) {
    res.status(400).json({
      message: e.message
    })
  }
}