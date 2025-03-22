import AgencyDetails from '@/components/forms/agency-details';
import UserDetails from '@/components/forms/user-details';
import { db } from '@/lib/db';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { auth } from '@clerk/nextjs/server';
import React from 'react';

type Props = {
  params: { agencyId: string };
};

const SettingsPage = async ({ params }: Props) => {
  const authResult = await auth();
  if (!authResult.userId) return null;

  // Fetch the full user details from Clerk
  const user = await clerkClient.users.getUser(authResult.userId);

  // Check if user.emailAddresses is defined and has at least one email address
  if (!user.emailAddresses || user.emailAddresses.length === 0) {
    console.error('No email addresses found for the user');
    return null;
  }

  const userEmail = user.emailAddresses[0].emailAddress;

  const userDetails = await db.user.findUnique({
    where: {
      email: userEmail,
    },
  });

  if (!userDetails) return null;

  const agencyDetails = await db.agency.findUnique({
    where: {
      id: params.agencyId,
    },
    include: {
      SubAccount: true,
    },
  });

  if (!agencyDetails) return null;

  const subAccounts = agencyDetails.SubAccount;

  return (
    <div className="flex lg:!flex-row flex-col gap-4">
      <AgencyDetails data={agencyDetails} />
      <UserDetails
        type="agency"
        id={params.agencyId}
        subAccounts={subAccounts}
        userData={userDetails}
      />
    </div>
  );
};

export default SettingsPage;