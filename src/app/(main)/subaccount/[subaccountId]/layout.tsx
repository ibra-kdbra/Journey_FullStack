import InfoBar from '@/components/global/infobar';
import Sidebar from '@/components/sidebar';
import Unauthorized from '@/components/unauthorized';
import {
  getAuthUserDetails,
  getNotificationAndUser,
  verifyAndAcceptInvitation,
} from '@/lib/queries';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';
import React from 'react';

type Props = {
  children: React.ReactNode;
  params: { subaccountId: string };
};

const SubaccountLayout = async ({ children, params }: Props) => {
  const agencyId = await verifyAndAcceptInvitation();
  if (!agencyId) return <Unauthorized />;

  const authResult = await auth();
  if (!authResult.userId) {
    return redirect('/');
  }

  // Fetch the full user details from Clerk
  const user = await clerkClient.users.getUser(authResult.userId);

  // Check if user.privateMetadata.role exists
  const userRole = user.privateMetadata?.role as Role;
  if (!userRole) {
    return <Unauthorized />;
  }

  let notifications: any = [];

  const allPermissions = await getAuthUserDetails();
  const hasPermission = allPermissions?.Permissions.find(
    (permissions) =>
      permissions.access && permissions.subAccountId === params.subaccountId
  );

  if (!hasPermission) {
    return <Unauthorized />;
  }

  const allNotifications = await getNotificationAndUser(agencyId);

  if (userRole === 'AGENCY_ADMIN' || userRole === 'AGENCY_OWNER') {
    notifications = allNotifications;
  } else {
    const filteredNoti = allNotifications?.filter(
      (item) => item.subAccountId === params.subaccountId
    );
    if (filteredNoti) notifications = filteredNoti;
  }

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar id={params.subaccountId} type="subaccount" />
      <div className="md:pl-[300px]">
        <InfoBar
          notifications={notifications}
          role={userRole}
          subAccountId={params.subaccountId as string}
        />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
};

export default SubaccountLayout;