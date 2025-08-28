import { NextRequest, NextResponse } from 'next/server';
import { CreateSingleLinkSchema, PlanParamSchema } from '@/lib/validators';
import { jsonError } from '@/lib/api';
import { readAdminFromAuthorization } from '@/lib/adminAuth';
import { getOrCreateGardenerByName, listGardeners } from '@/lib/repositories/gardeners';
import { createOrUpdateLinkForPlan, createOrUpdateLinksForPlan } from '@/lib/repositories/planLinks';
import { createPlanIfMissing } from '@/lib/repositories/plans';

export async function POST(req: NextRequest) {
  const session = readAdminFromAuthorization(req);
  if (!session) {
    return jsonError('unauthorized', 'Unauthorized', 401);
  }
  const body = await req.json().catch(() => null);
  // Two modes: bulk create for all gardeners, or create single link by name with optional deadline
  const singleParsed = CreateSingleLinkSchema.safeParse(body);
  const bulkParsed = PlanParamSchema.safeParse(body);
  if (!singleParsed.success && !bulkParsed.success) {
    return jsonError('invalid_body', 'Invalid request body', 400);
  }
  const { plan } = (singleParsed.success ? singleParsed.data : bulkParsed.data);
  const year = Number(plan.slice(0, 4));
  const month = Number(plan.slice(5, 7));
  const planDoc = await createPlanIfMissing(year, month);
  const origin = new URL(req.url).origin;
  if (singleParsed.success) {
    const { gardenerName, deadline } = singleParsed.data;
    let gardener;
    try {
      gardener = await getOrCreateGardenerByName(gardenerName);
    } catch (e) {
      return jsonError('invalid_gardener', 'Unknown gardener name', 400);
    }
    const expiresAt = deadline ? new Date(deadline) : null;
    const token = await createOrUpdateLinkForPlan(planDoc._id, gardener._id, expiresAt ?? undefined);
    const url = `${origin}/plan/${plan}?g=${gardener._id.toString()}&t=${token}`;
    return NextResponse.json({ link: { gardener_id: gardener._id.toString(), gardener: gardener.name, token, url, expires_at: expiresAt } });
  } else {
    const gardeners = await listGardeners();
    const tokens = await createOrUpdateLinksForPlan(
      planDoc._id,
      gardeners.map((g) => g._id),
    );
    const links = gardeners.map((g) => {
      const gardenerId = g._id.toString();
      const token = tokens[gardenerId];
      const url = `${origin}/plan/${plan}?g=${gardenerId}&t=${token}`;
      return { gardener_id: gardenerId, gardener: g.name, token, url };
    });
    return NextResponse.json({ links });
  }
}
