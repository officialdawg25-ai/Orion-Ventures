import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type Portfolio = {
  id: string;
  name: string;
  base_currency: string;
  created_at: string;
};

export type Venture = {
  id: string;
  portfolio_id: string;
  name: string;
  description: string;
  venture_type: string;
  lifecycle_stage: string;
  status: string;
  currency_code: string;
  created_at: string;
  updated_at: string;
};

export type EvidenceItem = {
  id: string;
  portfolio_id: string;
  venture_id: string | null;
  title: string;
  evidence_type: string;
  source_url: string | null;
  source_reference: string | null;
  observed_at: string | null;
  collected_at: string;
  confidence: number | null;
  limitations: string;
};

export type Decision = {
  id: string;
  portfolio_id: string;
  venture_id: string | null;
  title: string;
  decision_type: string;
  rationale: string;
  status: string;
  review_at: string | null;
  created_at: string;
};

export type StageReview = {
  id: string;
  portfolio_id: string;
  venture_id: string;
  from_stage: string;
  proposed_stage: string;
  rationale: string;
  evidence_summary: string;
  spend_cap: number | null;
  currency_code: string;
  success_criteria: string;
  stop_criteria: string;
  next_review_at: string | null;
  status: "proposed" | "approved" | "rejected";
  reviewer_notes: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  applied_at: string | null;
  created_at: string;
};

export type StageReviewEvidence = {
  id: string;
  portfolio_id: string;
  stage_review_id: string;
  evidence_item_id: string;
};

export type PortfolioRole = "owner" | "admin" | "editor" | "viewer";

function requireClient() {
  if (!supabase) throw new Error("Supabase is not configured for this environment.");
  return supabase;
}

export async function listPortfolios() {
  const client = requireClient();
  const { data, error } = await client
    .from("portfolios")
    .select("id,name,base_currency,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Portfolio[];
}

export async function createPortfolio(name: string, currency: string, user: User) {
  const client = requireClient();
  const id = crypto.randomUUID();
  const { error } = await client
    .from("portfolios")
    .insert({ id, name: name.trim(), base_currency: currency, created_by: user.id });
  if (error) throw error;

  // Fetch in a separate statement after the owner-membership trigger has completed.
  const { data, error: fetchError } = await client
    .from("portfolios")
    .select("id,name,base_currency,created_at")
    .eq("id", id)
    .single();
  if (fetchError) throw fetchError;
  return data as Portfolio;
}

export async function listVentures(portfolioId: string) {
  const client = requireClient();
  const { data, error } = await client
    .from("ventures")
    .select("id,portfolio_id,name,description,venture_type,lifecycle_stage,status,currency_code,created_at,updated_at")
    .eq("portfolio_id", portfolioId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Venture[];
}

export async function createVenture(input: {
  portfolioId: string;
  name: string;
  description: string;
  ventureType: string;
  currencyCode: string;
}) {
  const client = requireClient();
  const { data, error } = await client
    .from("ventures")
    .insert({
      portfolio_id: input.portfolioId,
      name: input.name.trim(),
      description: input.description.trim(),
      venture_type: input.ventureType,
      currency_code: input.currencyCode,
    })
    .select("id,portfolio_id,name,description,venture_type,lifecycle_stage,status,currency_code,created_at,updated_at")
    .single();
  if (error) throw error;
  return data as Venture;
}

export async function listEvidence(portfolioId: string) {
  const client = requireClient();
  const { data, error } = await client
    .from("evidence_items")
    .select("id,portfolio_id,venture_id,title,evidence_type,source_url,source_reference,observed_at,collected_at,confidence,limitations")
    .eq("portfolio_id", portfolioId)
    .order("collected_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as EvidenceItem[];
}

export async function createEvidence(input: {
  portfolioId: string;
  ventureId: string | null;
  title: string;
  evidenceType: string;
  sourceUrl: string;
  sourceReference: string;
  limitations: string;
  user: User;
}) {
  const client = requireClient();
  const { data, error } = await client
    .from("evidence_items")
    .insert({
      portfolio_id: input.portfolioId,
      venture_id: input.ventureId,
      title: input.title.trim(),
      evidence_type: input.evidenceType,
      source_url: input.sourceUrl.trim() || null,
      source_reference: input.sourceReference.trim() || null,
      limitations: input.limitations.trim(),
      created_by: input.user.id,
    })
    .select("id,portfolio_id,venture_id,title,evidence_type,source_url,source_reference,observed_at,collected_at,confidence,limitations")
    .single();
  if (error) throw error;
  return data as EvidenceItem;
}

export async function listDecisions(portfolioId: string) {
  const client = requireClient();
  const { data, error } = await client
    .from("decisions")
    .select("id,portfolio_id,venture_id,title,decision_type,rationale,status,review_at,created_at")
    .eq("portfolio_id", portfolioId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as Decision[];
}

export async function createDecision(input: {
  portfolioId: string;
  ventureId: string | null;
  title: string;
  decisionType: string;
  rationale: string;
  reviewAt: string | null;
  user: User;
}) {
  const client = requireClient();
  const { data, error } = await client
    .from("decisions")
    .insert({
      portfolio_id: input.portfolioId,
      venture_id: input.ventureId,
      title: input.title.trim(),
      decision_type: input.decisionType,
      rationale: input.rationale.trim(),
      review_at: input.reviewAt,
      created_by: input.user.id,
    })
    .select("id,portfolio_id,venture_id,title,decision_type,rationale,status,review_at,created_at")
    .single();
  if (error) throw error;
  return data as Decision;
}

export async function listStageReviews(portfolioId: string) {
  const client = requireClient();
  const { data, error } = await client
    .from("venture_stage_reviews")
    .select("id,portfolio_id,venture_id,from_stage,proposed_stage,rationale,evidence_summary,spend_cap,currency_code,success_criteria,stop_criteria,next_review_at,status,reviewer_notes,reviewed_by,reviewed_at,applied_at,created_at")
    .eq("portfolio_id", portfolioId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as StageReview[];
}

export async function listStageReviewEvidence(portfolioId: string) {
  const client = requireClient();
  const { data, error } = await client
    .from("venture_stage_review_evidence")
    .select("id,portfolio_id,stage_review_id,evidence_item_id")
    .eq("portfolio_id", portfolioId);
  if (error) throw error;
  return (data ?? []) as StageReviewEvidence[];
}

export async function getMyPortfolioRole(portfolioId: string, userId: string) {
  const client = requireClient();
  const { data, error } = await client
    .from("portfolio_memberships")
    .select("role,status")
    .eq("portfolio_id", portfolioId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data?.status === "active" ? data.role as PortfolioRole : null;
}

export async function createStageReview(input: {
  portfolioId: string;
  ventureId: string;
  proposedStage: string;
  rationale: string;
  evidenceSummary: string;
  spendCap: number | null;
  currencyCode: string;
  successCriteria: string;
  stopCriteria: string;
  nextReviewAt: string | null;
  evidenceItemIds: string[];
}) {
  const client = requireClient();
  const { data, error } = await client.rpc("create_stage_review", {
    p_portfolio_id: input.portfolioId,
    p_venture_id: input.ventureId,
    p_proposed_stage: input.proposedStage,
    p_rationale: input.rationale.trim(),
    p_evidence_summary: input.evidenceSummary.trim(),
    p_spend_cap: input.spendCap,
    p_currency_code: input.currencyCode,
    p_success_criteria: input.successCriteria.trim(),
    p_stop_criteria: input.stopCriteria.trim(),
    p_next_review_at: input.nextReviewAt,
    p_evidence_item_ids: input.evidenceItemIds,
  });
  if (error) throw error;
  return data as string;
}

export async function decideStageReview(input: {
  portfolioId: string;
  reviewId: string;
  userId: string;
  status: "approved" | "rejected";
  reviewerNotes: string;
}) {
  const client = requireClient();
  const { data, error } = await client
    .from("venture_stage_reviews")
    .update({
      status: input.status,
      reviewed_by: input.userId,
      reviewed_at: new Date().toISOString(),
      reviewer_notes: input.reviewerNotes.trim(),
    })
    .eq("portfolio_id", input.portfolioId)
    .eq("id", input.reviewId)
    .eq("status", "proposed")
    .select("id,status,applied_at")
    .single();
  if (error) throw error;
  return data as Pick<StageReview, "id" | "status" | "applied_at">;
}
