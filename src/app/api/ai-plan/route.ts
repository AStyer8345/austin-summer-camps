import { NextRequest, NextResponse } from 'next/server';
import { SAMPLE_CAMP_DATA } from '@/lib/sample-data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { childName, childAge, interests, budgetPerWeek, weeksNeeded, campType, regions } = body;

    // Build camp context for AI
    const availableCamps = SAMPLE_CAMP_DATA.filter(camp => {
      if (camp.ages_min > childAge || camp.ages_max < childAge) return false;
      if (campType && campType !== 'both' && camp.camp_type !== campType && camp.camp_type !== 'both') return false;
      if (regions && regions.length > 0 && !regions.includes(camp.region)) return false;
      if (budgetPerWeek && camp.price_min && camp.price_min > budgetPerWeek * 1.2) return false;
      return true;
    });

    const campSummaries = availableCamps.map(c =>
      `- ${c.name} (${c.category}): Ages ${c.ages_min}-${c.ages_max}, $${c.price_min || '?'}-${c.price_max || '?'}/wk, ${c.city}. ${c.notes || ''}`
    ).join('\n');

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // Fallback: generate a simple rule-based plan without AI
      return NextResponse.json(generateFallbackPlan({
        childName, childAge, interests, budgetPerWeek, weeksNeeded, availableCamps
      }));
    }

    const systemPrompt = `You are a helpful summer camp advisor for families in Austin, TX. You have detailed knowledge of local summer camps and help parents create the perfect summer schedule for their children.

Available camps for this child:
${campSummaries}

Respond with a JSON object (no markdown, just raw JSON) with this structure:
{
  "suggestions": [
    {
      "campName": "exact camp name from list",
      "campId": "camp id",
      "weekLabel": "Jun 2 - Jun 6",
      "reason": "brief reason why this camp is great for the child",
      "estimatedCost": 350
    }
  ],
  "summary": "A friendly 2-3 sentence summary of the summer plan",
  "totalCost": 0,
  "tips": ["tip 1", "tip 2"]
}`;

    const userPrompt = `Create a summer camp schedule for ${childName} (age ${childAge}).

Child's interests: ${interests.join(', ')}
Budget per week: $${budgetPerWeek}
Weeks needed: ${weeksNeeded} weeks (June-August 2026)
${campType ? `Camp type preference: ${campType}` : ''}
${regions?.length ? `Preferred regions: ${regions.join(', ')}` : ''}

Please suggest ${weeksNeeded} camps, one per week, that would make an amazing summer. Mix activities to keep things exciting while respecting the budget. Prioritize variety and the child's interests.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', errorText);
      return NextResponse.json(generateFallbackPlan({
        childName, childAge, interests, budgetPerWeek, weeksNeeded, availableCamps
      }));
    }

    const aiResponse = await response.json();
    const content = aiResponse.content[0]?.text;

    try {
      const plan = JSON.parse(content);
      return NextResponse.json(plan);
    } catch {
      // If AI response isn't valid JSON, use fallback
      return NextResponse.json(generateFallbackPlan({
        childName, childAge, interests, budgetPerWeek, weeksNeeded, availableCamps
      }));
    }
  } catch (error) {
    console.error('AI plan error:', error);
    return NextResponse.json(
      { error: 'Failed to generate plan' },
      { status: 500 }
    );
  }
}

interface FallbackPlanInput {
  childName: string;
  childAge: number;
  interests: string[];
  budgetPerWeek: number;
  weeksNeeded: number;
  availableCamps: typeof SAMPLE_CAMP_DATA;
}

function generateFallbackPlan({ childName, childAge, interests, budgetPerWeek, weeksNeeded, availableCamps }: FallbackPlanInput) {
  // Simple rule-based plan generation
  const weeks = [
    'Jun 2 - Jun 6', 'Jun 9 - Jun 13', 'Jun 16 - Jun 20', 'Jun 23 - Jun 27',
    'Jun 30 - Jul 3', 'Jul 7 - Jul 11', 'Jul 14 - Jul 18', 'Jul 21 - Jul 25',
    'Jul 28 - Aug 1', 'Aug 4 - Aug 8', 'Aug 11 - Aug 15',
  ];

  // Score camps by interest match
  const scoredCamps = availableCamps.map(camp => {
    let score = 0;
    const campText = `${camp.name} ${camp.category} ${camp.notes || ''} ${(camp.tags || []).join(' ')}`.toLowerCase();
    for (const interest of interests) {
      if (campText.includes(interest.toLowerCase())) score += 10;
    }
    // Budget fit
    if (camp.price_min && camp.price_min <= budgetPerWeek) score += 5;
    // Prefer camps with age in sweet spot
    const midAge = (camp.ages_min + camp.ages_max) / 2;
    if (Math.abs(midAge - childAge) < 3) score += 3;
    return { camp, score };
  }).sort((a, b) => b.score - a.score);

  const suggestions = [];
  const usedCampIds = new Set<string>();
  let totalCost = 0;

  for (let i = 0; i < Math.min(weeksNeeded, weeks.length); i++) {
    // Find best unused camp
    const pick = scoredCamps.find(s => !usedCampIds.has(s.camp.id));
    if (!pick) break;

    usedCampIds.add(pick.camp.id);
    const cost = pick.camp.price_min || pick.camp.price_max || 0;
    totalCost += cost;

    suggestions.push({
      campName: pick.camp.name,
      campId: pick.camp.id,
      weekLabel: weeks[i],
      reason: pick.camp.notes || `Great ${SAMPLE_CAMP_DATA.find(c => c.id === pick.camp.id)?.category.replace('_', ' ')} option for age ${childAge}`,
      estimatedCost: cost,
    });
  }

  return {
    suggestions,
    summary: `Here's a ${suggestions.length}-week summer plan for ${childName}! We've picked camps that match their interests in ${interests.slice(0, 3).join(', ')} while staying within your budget.`,
    totalCost,
    tips: [
      'Register early - many Austin camps fill up by March!',
      'Ask about sibling discounts and early bird pricing.',
      'Check if your employer offers dependent care FSA for camp costs.',
    ],
  };
}
