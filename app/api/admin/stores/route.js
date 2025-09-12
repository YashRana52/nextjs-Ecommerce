import prisma from "@/lib/prisma";
import { authAdmin } from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

//get all approved request
export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json(
        {
          error: "not auhtorized",
        },
        {
          status: 401,
        }
      );
    }

    const stores = await prisma.store.findMany({
      where: { status: { in: ["approved"] } },
      include: { user: true },
    });

    return NextResponse.json({ stores });
  } catch (error) {
    return NextResponse.json(
      {
        error: error.code || error.message,
      },
      { status: 400 }
    );
  }
}
