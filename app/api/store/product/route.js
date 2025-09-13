import imagekit from "@/configs/imagekit";
import prisma from "@/lib/prisma";
import { authSeller } from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

//Add a new product
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    console.log(userId);

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const storeId = await authSeller(userId);
    console.log(storeId);

    if (!storeId) {
      return NextResponse.json(
        {
          error: "not authorized",
        },
        { status: 401 }
      );
    }

    //Get the data from the form

    const formData = await request.formData();

    const name = formData.get("name");
    const description = formData.get("description");
    const mrp = Number(formData.get("mrp"));
    const price = Number(formData.get("price"));
    const category = formData.get("category");
    const images = formData.getAll("images");

    if (
      !name ||
      !description ||
      !mrp ||
      !price ||
      !category ||
      images.length < 1
    ) {
      return NextResponse.json(
        {
          error: "missing product details",
        },
        { status: 401 }
      );
    }

    // upload image to imagekit

    const imagesUrl = await Promise.all(
      images.map(async (image) => {
        const buffer = Buffer.from(await image.arrayBuffer());

        const response = await imagekit.upload({
          file: buffer,
          fileName: image.fileName || "product-image",
          folder: "product",
        });

        const url = imagekit.url({
          path: response.filePath,
          transformation: [
            {
              quality: "auto",
            },
            {
              format: "webp",
            },

            {
              width: "1024",
            },
          ],
        });

        return url;
      })
    );

    await prisma.product.create({
      data: {
        name,
        description,
        mrp,
        price,
        category,
        images: imagesUrl,
        storeId,
      },
    });

    return NextResponse.json({
      message: "product addedd successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: error.code || error.message,
      },
      { status: 400 }
    );
  }
}

//get all products for seller

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json(
        {
          error: "not authorized",
        },
        { status: 401 }
      );
    }

    const products = await prisma.product.findMany({ where: { storeId } });

    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      {
        error: error.code || error.message,
      },
      { status: 400 }
    );
  }
}
