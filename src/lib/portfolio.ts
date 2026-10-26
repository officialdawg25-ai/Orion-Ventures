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
  const { data, error } = await client
    .from("portfolios")
    .insert({ name: name.trim(), base_currency: currency, created_by: user.id })
    .select("id,name,base_currency,created_at")
    .single();
  if (error) throw error;
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
