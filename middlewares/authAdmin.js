import { clerkClient } from "@clerk/clerk-sdk-node";

export const authAdmin = async (userId) => {
  try {
    if (!userId) {
      console.log(" No userId provided");
      return false;
    }

    const user = await clerkClient.users.getUser(userId);

    const primaryEmail = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId
    )?.emailAddress;

    const isAdmin = process.env.ADMIN_EMAIL.split(",").includes(primaryEmail);

    return isAdmin;
  } catch (error) {
    console.error(" authAdmin error:", error);
    return false;
  }
};
