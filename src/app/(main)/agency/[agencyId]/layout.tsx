import BlurPage from '@/components/global/blur-page';
import InfoBar from '@/components/global/infobar';
import Sidebar from '@/components/sidebar';
import Unauthorized from '@/components/unauthorized';
import {
  getNotificationAndUser,
  verifyAndAcceptInvitation,
} from '@/lib/queries';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react';

type Props = {
  children: React.ReactNode;
  params: { agencyId: string };
};

const Layout = async ({ children, params }: Props) => {
  const agencyId = await verifyAndAcceptInvitation();
  const authResult = await auth();

  if (!authResult.userId) {
    return redirect('/');
  }

  // Fetch the full user details from Clerk
  const user = await clerkClient.users.getUser(authResult.userId);

  if (!agencyId) {
    return redirect('/agency');
  }

  // Check the user's role from privateMetadata
  const userRole = user.privateMetadata?.role;
  if (userRole !== 'AGENCY_OWNER' && userRole !== 'AGENCY_ADMIN') {
    return <Unauthorized />;
  }

  let allNoti: any = [];
  const notifications = await getNotificationAndUser(agencyId);
  if (notifications) allNoti = notifications;

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar id={params.agencyId} type="agency" />
      <div className="md:pl-[300px]">
        <InfoBar notifications={allNoti} role={userRole} />
        <div className="relative">
          <BlurPage>{children}</BlurPage>
        </div>
      </div>
    </div>
  );
};

export default Layout;