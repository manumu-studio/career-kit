/** MSW request handlers for all backend API endpoints. */
import { http, HttpResponse } from "msw";
import {
  mockOptimizationResult,
  mockCoverLetterResult,
  mockCompanyResearchResult,
  mockHistoryEntry,
  mockProvidersResponse,
  mockComparisonResult,
} from "@/test/mocks";

const API_BASE = "http://localhost:8000";

export const handlers = [
  http.post(`${API_BASE}/optimize`, () => {
    return HttpResponse.json(mockOptimizationResult());
  }),

  http.post(`${API_BASE}/cover-letter`, () => {
    return HttpResponse.json(mockCoverLetterResult());
  }),

  http.post(`${API_BASE}/research-company`, () => {
    return HttpResponse.json(mockCompanyResearchResult());
  }),

  http.get(`${API_BASE}/providers`, () => {
    return HttpResponse.json(mockProvidersResponse());
  }),

  http.post(`${API_BASE}/compare`, () => {
    return HttpResponse.json(mockComparisonResult());
  }),

  http.get(`${API_BASE}/health`, () => {
    return HttpResponse.json({ status: "ok" });
  }),

  http.get(`${API_BASE}/history`, () => {
    return HttpResponse.json({
      items: [mockHistoryEntry()],
      total: 1,
      page: 1,
      limit: 20,
    });
  }),

  http.get(`${API_BASE}/history/:id`, ({ params }) => {
    const id = params.id as string;
    return HttpResponse.json({
      ...mockHistoryEntry({ id }),
      company_research_json: null,
      optimization_result_json: mockOptimizationResult(),
    });
  }),

  http.get(`${API_BASE}/history/stats`, () => {
    return HttpResponse.json({
      total_analyses: 10,
      cache_hits: 3,
      total_cost_usd: 0.5,
    });
  }),

  http.post(`${API_BASE}/history/check-research`, () => {
    return HttpResponse.json({
      cached: false,
      match: null,
    });
  }),

  http.post(`${API_BASE}/history/check-optimization`, () => {
    return HttpResponse.json({
      cached: false,
      match: null,
    });
  }),

  http.delete(`${API_BASE}/history/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.delete(`${API_BASE}/history`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
