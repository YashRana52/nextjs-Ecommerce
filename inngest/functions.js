import prisma from "@/lib/prisma";
import { inngest } from "./client";

// Inngest func to save user data to a database
export const synceUserCreation = inngest.createFunction(
  {
    id: "sync-user-create",
  },
  {
    event: "clerk/user.created",
  },
  async ({ event }) => {
    const { data } = event;

    // Get primary email
    const primaryEmail = data.email_addresses.find(
      (e) => e.id === data.primary_email_address_id
    )?.email_address;

    try {
      await prisma.user.create({
        data: {
          id: data.id,
          email: primaryEmail || "",
          name: `${data.first_name || ""} ${data.last_name || ""}`,
          image: data.image_url,
        },
      });
    } catch (err) {
      console.error("Prisma create error:", err);
    }
  }
);

// Inngest func to update user data to a database
export const syncUserUpdation = inngest.createFunction(
  {
    id: "sync-user-update",
  },
  {
    event: "clerk/user.updated",
  },
  async ({ event }) => {
    const { data } = event;

    const primaryEmail = data.email_addresses.find(
      (e) => e.id === data.primary_email_address_id
    )?.email_address;

    try {
      await prisma.user.update({
        where: { id: data.id },
        data: {
          email: primaryEmail || "",
          name: `${data.first_name || ""} ${data.last_name || ""}`,
          image: data.image_url,
        },
      });
    } catch (err) {
      console.error("Prisma update error:", err);
    }
  }
);

// Inngest func to delete user data from a database
export const syncUserDeletion = inngest.createFunction(
  {
    id: "sync-user-delete",
  },
  {
    event: "clerk/user.deleted",
  },
  async ({ event }) => {
    const { data } = event;

    try {
      await prisma.user.delete({
        where: { id: data.id },
      });
    } catch (err) {
      console.error("Prisma delete error:", err);
    }
  }
);
