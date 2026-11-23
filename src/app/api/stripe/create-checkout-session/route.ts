import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'
import { corsHeaders, isAllowedOrigin } from '@/lib/api-auth'

export async function POST(req: Request) {
  const {
    subAccountConnectAccId,
    prices,
    subaccountId,
  }: {
    subAccountConnectAccId: string
    prices: { recurring: boolean; productId: string }[]
    subaccountId: string
  } = await req.json()

  const origin = req.headers.get('origin')
  // Browsers from other origins must be on the allowlist.
  if (origin && !isAllowedOrigin(origin))
    return new NextResponse('Origin not allowed', { status: 403 })

  if (
    !subAccountConnectAccId ||
    !subaccountId ||
    !Array.isArray(prices) ||
    !prices.length
  )
    return new NextResponse('Stripe Account Id or price id is missing', {
      status: 400,
    })

  // The connected account must belong to the given sub account, and every
  // price must be one that sub account's funnels actually sell.
  const subAccount = await db.subAccount.findUnique({
    where: { id: subaccountId },
    include: { Funnels: true },
  })
  if (
    !subAccount ||
    !subAccount.connectAccountId ||
    subAccount.connectAccountId !== subAccountConnectAccId
  )
    return new NextResponse('Invalid account', { status: 403 })

  const sellable = new Set<string>()
  for (const funnel of subAccount.Funnels) {
    try {
      const live = JSON.parse(funnel.liveProducts || '[]')
      if (Array.isArray(live))
        for (const p of live) if (p?.productId) sellable.add(p.productId)
    } catch {}
  }
  if (!prices.every((p) => p && sellable.has(p.productId)))
    return new NextResponse('Invalid price', { status: 400 })
  if (
    !process.env.NEXT_PUBLIC_PLATFORM_SUBSCRIPTION_PERCENT ||
    !process.env.NEXT_PUBLIC_PLATFORM_ONETIME_FEE ||
    !process.env.NEXT_PUBLIC_PLATFORM_AGENY_PERCENT
  ) {
    console.log('VALUES DONT EXITS')
    return NextResponse.json({ error: 'Fees do not exist' })
  }

  // Not needed unless we want to send payments to this account.
  //CHALLENGE Transfer money to a connected
  // const agencyIdConnectedAccountId = await db.subAccount.findUnique({
  //   where: { id: subaccountId },
  //   include: { Agency: true },
  // })

  const subscriptionPriceExists = prices.find((price) => price.recurring)
  // if (!agencyIdConnectedAccountId?.Agency.connectAccountId) {
  //   console.log('Agency is not connected')
  //   return NextResponse.json({ error: 'Agency account is not connected' })
  // }

  try {
    const session = await stripe.checkout.sessions.create(
      {
        line_items: prices.map((price) => ({
          price: price.productId,
          quantity: 1,
        })),

        ...(subscriptionPriceExists && {
          subscription_data: {
            metadata: { connectAccountSubscriptions: 'true' },
            application_fee_percent:
              +process.env.NEXT_PUBLIC_PLATFORM_SUBSCRIPTION_PERCENT,
          },
        }),

        ...(!subscriptionPriceExists && {
          payment_intent_data: {
            metadata: { connectAccountPayments: 'true' },
            application_fee_amount:
              +process.env.NEXT_PUBLIC_PLATFORM_ONETIME_FEE * 100,
          },
        }),

        mode: subscriptionPriceExists ? 'subscription' : 'payment',
        ui_mode: 'embedded',
        redirect_on_completion: 'never',
      },
      { stripeAccount: subAccountConnectAccId }
    )

    return NextResponse.json(
      {
        clientSecret: session.client_secret,
      },
      {
        headers: corsHeaders(origin),
      }
    )
  } catch (error) {
    console.log('🔴 Error', error)
    //@ts-ignore
    return NextResponse.json({ error: error.message })
  }
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin')
  if (!isAllowedOrigin(origin)) return new NextResponse(null, { status: 403 })
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) })
}
