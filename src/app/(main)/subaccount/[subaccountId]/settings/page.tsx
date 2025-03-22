import SubAccountDetails from '@/components/forms/subaccount-details';
import UserDetails from '@/components/forms/user-details';
import BlurPage from '@/components/global/blur-page';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/clerk-sdk-node';
import React from 'react';

type Props = {
  params: { subaccountId: string };
};

const SubaccountSettingPage = async ({ params }: Props) => {
  const authResult = await auth();

  // Check if the user is authenticated
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

  const subAccount = await db.subAccount.findUnique({
    where: { id: params.subaccountId },
  });

  if (!subAccount) return null;

  const agencyDetails = await db.agency.findUnique({
    where: { id: subAccount.agencyId },
    include: { SubAccount: true },
  });

  if (!agencyDetails) return null;

  const subAccounts = agencyDetails.SubAccount;

  return (
    <BlurPage>
      <div className="flex lg:!flex-row flex-col gap-4">
        <SubAccountDetails
          agencyDetails={agencyDetails}
          details={subAccount}
          userId={userDetails.id}
          userName={userDetails.name}
        />
        <UserDetails
          type="subaccount"
          id={params.subaccountId}
          subAccounts={subAccounts}
          userData={userDetails}
        />
      </div>
    </BlurPage>
  );
};

export default SubaccountSettingPage;