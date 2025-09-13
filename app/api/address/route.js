import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

import { NextResponse } from "next/server";

//Add new address
export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    const { address } = await request.json();

    address.userId = userId;

    //save the address to the user object
    const newAddress = await prisma.address.create({
      data: address,
    });

    return NextResponse.json({
      newAddress,
      message: "address added successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error.code || error.message,
      },
      { status: 500 }
    );
  }
}

//get all address for a user

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    //save the address to the user object
    const addresses = await prisma.address.findMany({
      where: { userId },
    });

    return NextResponse.json({
      addresses,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error.code || error.message,
      },
      { status: 500 }
    );
  }
}
