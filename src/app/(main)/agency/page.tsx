import AgencyDetails from '@/components/forms/agency-details';
import { getAuthUserDetails, verifyAndAcceptInvitation } from '@/lib/queries';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { auth } from '@clerk/nextjs/server';
import { Plan } from '@prisma/client';
import { redirect } from 'next/navigation';
import React from 'react';

const Page = async ({
  searchParams,
}: {
  searchParams: { plan: Plan; state: string; code: string };
}) => {
  const agencyId = await verifyAndAcceptInvitation();
  console.log(agencyId);

  // Get the user's details
  const user = await getAuthUserDetails();
  if (agencyId) {
    if (user?.role === 'SUBACCOUNT_GUEST' || user?.role === 'SUBACCOUNT_USER') {
      return redirect('/subaccount');
    } else if (user?.role === 'AGENCY_OWNER' || user?.role === 'AGENCY_ADMIN') {
      if (searchParams.plan) {
        return redirect(`/agency/${agencyId}/billing?plan=${searchParams.plan}`);
      }
      if (searchParams.state) {
        const statePath = searchParams.state.split('___')[0];
        const stateAgencyId = searchParams.state.split('___')[1];
        if (!stateAgencyId) return <div>Not authorized</div>;
        return redirect(
          `/agency/${stateAgencyId}/${statePath}?code=${searchParams.code}`
        );
      } else {
        return redirect(`/agency/${agencyId}`);
      }
    } else {
      return <div>Not authorized</div>;
    }
  }

  // Fetch the authenticated user's details
  const authResult = await auth();
  if (!authResult.userId) {
    return redirect('/sign-in');
  }

  const authUser = await clerkClient.users.getUser(authResult.userId);

  // Check if authUser.emailAddresses is defined and has at least one email address
  if (!authUser.emailAddresses || authUser.emailAddresses.length === 0) {
    console.error('No email addresses found for the user');
    return <div>No email addresses found for the user</div>;
  }

  const userEmail = authUser.emailAddresses[0].emailAddress;

  return (
    <div className="flex justify-center items-center mt-4">
      <div className="max-w-[850px] border-[1px] p-4 rounded-xl">
        <h1 className="text-4xl">Create An Agency</h1>
        <AgencyDetails
          data={{ companyEmail: userEmail }}
        />
      </div>
    </div>
  );
};

export default Page;