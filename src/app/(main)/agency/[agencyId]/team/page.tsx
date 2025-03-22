import { db } from '@/lib/db';
import React from 'react';
import DataTable from './data-table';
import { Plus } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { columns } from './columns';
import SendInvitation from '@/components/forms/send-invitation';

type Props = {
  params: { agencyId: string };
};

const TeamPage = async ({ params }: Props) => {
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

  const teamMembers = await db.user.findMany({
    where: {
      Agency: {
        id: params.agencyId,
      },
    },
    include: {
      Agency: { include: { SubAccount: true } },
      Permissions: { include: { SubAccount: true } },
    },
  });

  const agencyDetails = await db.agency.findUnique({
    where: {
      id: params.agencyId,
    },
    include: {
      SubAccount: true,
    },
  });

  if (!agencyDetails) return null;

  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={15} />
          Add
        </>
      }
      modalChildren={<SendInvitation agencyId={agencyDetails.id} />}
      filterValue="name"
      columns={columns}
      data={teamMembers}
    />
  );
};

export default TeamPage;