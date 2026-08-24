import { db } from '../config/db.js';
import { matches } from '../models/schema.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getMatchStatus } from '../utils/matchStatus.js';
import { createMatchSchema } from '../validation/matches.validate.js';

const MAX_LIMIT = 100;

const getMatches = asyncHandler(async (req, res) => {
    const parsed = listMatchesQuerySchema.safeParse(req.query);

    if (!parsed.success) {
        return res.status(400).json({
            error: "Invalid query.",
            details: parsed.error.issues
        });
    }

    const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);

    const data = await db
        .select()
        .from(matches)
        .orderBy(desc(matches.createdAt))
        .limit(limit);

    return res.json({ data });
});

const postMatches = asyncHandler(async (req, res) => {
    const parsed = createMatchSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            error: 'Invalid payload.',
            details: parsed.error.issues,
        });
    }

    const { startTime, endTime, homeScore, awayScore } = parsed.data;

    const [event] = await db.insert(matches).values({
        ...parsed.data,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        homeScore: homeScore ?? 0,
        awayScore: awayScore ?? 0,
        status: getMatchStatus(startTime, endTime),
    }).returning();

    if (res.app.locals.broadcastMatchCreated) {
        res.app.locals.broadcastMatchCreated(event);
    }

    res.status(201).json({ data: event });
});

const updateScore = asyncHandler(async (req, res) => {
    const paramsParsed = matchIdParamSchema.safeParse(req.params);

    if (!paramsParsed.success) {
        return res
            .status(400)
            .json({
                error: "Invalid match id",
                details: formatZodError(paramsParsed.error)
            });
    }

    const bodyParsed = updateScoreSchema.safeParse(req.body);

    if (!bodyParsed.success) {
        return res
            .status(400)
            .json({
                error: "Invalid payload",
                details: formatZodError(bodyParsed.error)
            });
    }

    const matchId = paramsParsed.data.id;

    const [existing] = await db
        .select({
            id: matches.id,
            status: matches.status,
            startTime: matches.startTime,
            endTime: matches.endTime,
        })
        .from(matches)
        .where(eq(matches.id, matchId))
        .limit(1);

    if (!existing) {
        return res.status(404).json({
            error: "Match not found"
        });
    }

    await syncMatchStatus(existing, async (nextStatus) => {
        await db
            .update(matches)
            .set({ status: nextStatus })
            .where(eq(matches.id, matchId));
    });

    if (existing.status !== MATCH_STATUS.LIVE) {
        return res.status(409).json({
            error: "Match is not live"
        });
    }

    const [updated] = await db
        .update(matches)
        .set({
            homeScore: bodyParsed.data.homeScore,
            awayScore: bodyParsed.data.awayScore,
        })
        .where(eq(matches.id, matchId))
        .returning();

    if (res.app.locals.broadcastScoreUpdate) {
        res.app.locals.broadcastScoreUpdate(matchId, {
            homeScore: updated.homeScore,
            awayScore: updated.awayScore,
        });
    }

    return res.json({
        data: updated
    });
});

export { getMatches, postMatches, updateScore };