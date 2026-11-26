import { FREE_QUOTA, PRO_QUOTA } from "@/config";
import { db } from "@/db";
import { DiscordClient } from "@/lib/discord-client";
import { CATEGORY_NAME_VALIDATOR } from "@/lib/validators/category-validator";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const REQUEST_VALIDATOR = z.object({
    category: CATEGORY_NAME_VALIDATOR,
    fields: z.record(z.string().or(z.number()).or(z.boolean())).optional(),
    description: z.string().optional()
}).strict()

export const POST = async (req: NextRequest) => {
    try {
        const authHeader = req.headers.get("Authorization")

        if(!authHeader){
            return NextResponse.json({ message: "Unauthoruzed" }, { status: 401 })
        }
    
        if(!authHeader.startsWith("Bearer ")){
            return NextResponse.json({
                message: "Invalid auth header format. Expected: 'Bearer [API_KEY]'"
            }, {
                status: 401
            })
        }
    
        const apiKey = authHeader.split(" ")[1]
    
        if(!apiKey || apiKey.trim() === ""){
            return NextResponse.json({
                message: "Invalid API Key"
            }, {
                status: 401
            })
        }
    
        const user = await db.user.findUnique({
            where: { apiKey },
            include: { EventCategories: true },
        })
    
        if(!user){
            return NextResponse.json({
                message: "Invalid auth header format. Expected: 'Bearer [API_KEY]'"
            }, {
                status: 401
            })
        }
    
        if(!user.discordId){
            return NextResponse.json({
                message: "Please enter your discord ID in your account settings."
            }, {
                status: 403
            })
        }
    
        // Actual Logic after checking the validity of user and apikey

        // Validate the request before touching quota or Discord
        let requestData: unknown

        try {
            requestData = await req.json()
        } catch (error) {
            return NextResponse.json({
                message: "Invalid JSON request body"
            }, { status: 400 })
        }

        const validationResults = REQUEST_VALIDATOR.parse(requestData)

        const category = user.EventCategories.find(
            (cat) => cat.name === validationResults.category
        )

        if(!category){
            return NextResponse.json({
                message: `You have no category named ${validationResults.category}`
            }, {
                status: 404
            })
        }

        const currentDate = new Date()
        const currentMonth = currentDate.getMonth() + 1
        const currentYear = currentDate.getFullYear()
        const quotaKey = {
            userId_year_month: {
                userId: user.id,
                year: currentYear,
                month: currentMonth,
            },
        }

        const quotaLimit = user.plan === "FREE" ? FREE_QUOTA.maxEventsPerMonth : PRO_QUOTA.maxEventsPerMonth

        // Make sure the row exists, then reserve one unit with a single
        // conditional UPDATE so concurrent requests cannot exceed the limit.
        await db.quota.upsert({
            where: quotaKey,
            update: {},
            create: {
                userId: user.id,
                month: currentMonth,
                year: currentYear,
                count: 0,
            },
        })

        const reserved = await db.quota.updateMany({
            where: {
                userId: user.id,
                year: currentYear,
                month: currentMonth,
                count: { lt: quotaLimit },
            },
            data: { count: { increment: 1 } },
        })

        if(reserved.count === 0){
            return NextResponse.json({
                message: "Monthly qouta reached. Please upgrade your plan for more events."
            }, {
                status: 429
            })
        }

        const releaseQuota = () =>
            db.quota.updateMany({
                where: {
                    userId: user.id,
                    year: currentYear,
                    month: currentMonth,
                    count: { gt: 0 },
                },
                data: { count: { decrement: 1 } },
            })

        const discord = new DiscordClient(process.env.DISCORD_BOT_TOKEN)

        let dmChannel
        try {
            dmChannel = await discord.createDM(user.discordId)
        } catch (error) {
            await releaseQuota()
            throw error
        }

        const eventData = {
            title: `${category.emoji || "🔔"} ${category.name.charAt(0).toUpperCase() + category.name.slice(1)}`,
            description: validationResults.description || `A new ${category.name} event occurred!`,
            color: category.color,
            timestamp: new Date().toISOString(),
            fields: Object.entries(validationResults.fields || {}).map(
                ([key, value]) => {
                    return{
                        name: key,
                        value: String(value),
                        inline: true,
                    }
                }
            )
        }
    
        const event = await db.event.create({
            data: {
                name: category.name,
                formattedMessage: `${eventData.title}\n\n${eventData.description}`,
                userId: user.id,
                fields: validationResults.fields || {},
                eventCategoryId: category.id
            }
        })
    
        try {
            
            await discord.sendEmbed(dmChannel.id, eventData)
    
            await db.event.update({
                where: { id: event.id },
                data: { deliveryStatus: "DELIVERED" }
            })

        } catch (error) {
            await db.event.update({
                where: { id: event.id },
                data: { deliveryStatus: "FAILED" }
            })

            await releaseQuota()
    
            console.log(error)
    
            return NextResponse.json({
                message: "Error processing event",
                eventId: event.id
            }, {
                status: 500
            })
        }
    
        return NextResponse.json({
            message: "Event processed successfully",
            eventId: event.id,
        })
    } catch (error) {
        console.error(error)
        if(error instanceof z.ZodError){
            return NextResponse.json({ message: error.message},{ status: 422 })
        }
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })   
    }
}