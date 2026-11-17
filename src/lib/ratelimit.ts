import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { NextRequest } from 'next/server';

// Supports both direct Upstash Redis and Vercel KV Marketplace integrations
const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

export const isRateLimitingEnabled = Boolean(redisUrl && redisToken);

const redis = isRateLimitingEnabled
    ? new Redis({
        url: redisUrl!,
        token: redisToken!,
    })
    : null;

// Tiered limiters using sliding window:
// 1. Auth: 10 requests per 60s per IP (stops credential stuffing and Resend email spam)
export const authRateLimiter = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '60 s'),
        analytics: true,
        prefix: 'rgap:ratelimit:auth',
    })
    : null;

// 2. API: 60 requests per 60s per IP (protects /api/grants, /api/geocode, etc.)
export const apiRateLimiter = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, '60 s'),
        analytics: true,
        prefix: 'rgap:ratelimit:api',
    })
    : null;

// 3. Pages: 120 requests per 60s per IP (allows normal browsing while stopping rapid programmatic scrapers)
export const pageRateLimiter = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(120, '60 s'),
        analytics: true,
        prefix: 'rgap:ratelimit:page',
    })
    : null;

export type RateLimitTier = 'auth' | 'api' | 'page';

/**
 * Extracts client IP address from Vercel / Cloudflare / reverse proxy headers.
 */
export function getClientIp(request: NextRequest): string {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }
    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp.trim();
    }
    return (request as unknown as { ip?: string }).ip || '127.0.0.1';
}

/**
 * Check rate limit for a given tier and client identifier (e.g. IP).
 * If rate limiting credentials are not configured, gracefully passes through.
 */
export async function checkRateLimit(tier: RateLimitTier, identifier: string) {
    if (!isRateLimitingEnabled) {
        return {
            success: true,
            limit: 0,
            remaining: 0,
            reset: 0,
        };
    }

    const limiter =
        tier === 'auth'
            ? authRateLimiter
            : tier === 'api'
            ? apiRateLimiter
            : pageRateLimiter;

    if (!limiter) {
        return { success: true, limit: 0, remaining: 0, reset: 0 };
    }

    return await limiter.limit(identifier);
}
