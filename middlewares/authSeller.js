import prisma from "@/lib/prisma";

export const authSeller = async (userId) => {
  try {
    // Agar userId hi null/undefined hai to aage query mat chalao
    if (!userId) {
      return false;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { store: true },
    });

    if (user?.store) {
      if (user.store.status === "approved") {
        return user.store.id;
      } else {
        return false; // seller hai but approved nahi
      }
    }

    return false; // user ke paas store hi nahi hai
  } catch (error) {
    console.error(error);
    return false;
  }
};
