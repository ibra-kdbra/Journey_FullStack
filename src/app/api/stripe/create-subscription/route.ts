import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'
import { pricingCards } from '@/lib/constants'
import { forbidden, getAgencyAdmin, requireUserId, unauthorized } from '@/lib/api-auth'

export async function POST(req: Request) {
  if (!(await requireUserId())) return unauthorized()

  const { customerId, priceId } = await req.json()
  if (!customerId || !priceId)
    return new NextResponse('Customer Id or price id is missing', {
      status: 400,
    })

  // Only platform plans may be purchased through this route.
  const allowedPriceIds = pricingCards.map((c) => c.priceId).filter(Boolean)
  if (!allowedPriceIds.includes(priceId))
    return new NextResponse('Invalid price id', { status: 400 })

  // The caller must be an owner/admin of the agency that owns this customer.
  const admin = await getAgencyAdmin()
  if (!admin) return forbidden()

  const subscriptionExists = await db.agency.findFirst({
    where: { customerId, id: admin.agencyId! },
    include: { Subscription: true },
  })
  if (!subscriptionExists) return forbidden()

  try {
    if (
      subscriptionExists?.Subscription?.subscritiptionId &&
      subscriptionExists.Subscription.active
    ) {
      //update the subscription instead of creating one.
      if (!subscriptionExists.Subscription.subscritiptionId) {
        throw new Error(
          'Could not find the subscription Id to update the subscription.'
        )
      }
      console.log('Updating the subscription')
      const currentSubscriptionDetails = await stripe.subscriptions.retrieve(
        subscriptionExists.Subscription.subscritiptionId
      )

      const subscription = await stripe.subscriptions.update(
        subscriptionExists.Subscription.subscritiptionId,
        {
          items: [
            {
              id: currentSubscriptionDetails.items.data[0].id,
              deleted: true,
            },
            { price: priceId },
          ],
          expand: ['latest_invoice.payment_intent'],
        }
      )
      return NextResponse.json({
        subscriptionId: subscription.id,
        //@ts-ignore
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      })
    } else {
      console.log('Createing a sub')
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price: priceId,
          },
        ],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      })
      return NextResponse.json({
        subscriptionId: subscription.id,
        //@ts-ignore
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      })
    }
  } catch (error) {
    console.log('🔴 Error', error)
    return new NextResponse('Internal Server Error', {
      status: 500,
    })
  }
}
