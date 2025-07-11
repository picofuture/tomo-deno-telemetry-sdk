/**
 * Traced fetch implementation for Tomo Deno Telemetry SDK.
 * Provides a drop-in replacement for fetch with OpenTelemetry tracing.
 * @module process-fetch
 */
import { SpanKind, SpanStatusCode } from 'npm:@opentelemetry/api@1.9.0'
import { runWithSpan, setSpanAttributes } from './otel/tracing-utils.js'


/**
 * Sets HTTP attributes and status on a span based on response.
 * @param {object} span - The span
 * @param {object} res - The HTTP response
 */
function setHttpSpanStatus(span, res) {
  if (res && typeof res.status === 'number') {
    setSpanAttributes(span, {
      'httpStatusCode': res.status
    })
    span.setStatus({ code: res.status >= 400 ? SpanStatusCode.ERROR : SpanStatusCode.OK })
  }
}

async function setHTTPResponseBody(span, res) {
  if (!res) return res

  let bodyText = '';
  let responseType = '';
  const contentType = res.headers.get('content-type') || '';
  let clonedRes = res.clone();

  try {
    if (contentType.includes('application/json')) {
      const json = await clonedRes.json();
      bodyText = JSON.stringify(json);
      responseType = 'json';
    } else if (contentType.startsWith('text/')) {
      bodyText = await clonedRes.text();
      responseType = 'text';
    }
  } catch (err) {
    clonedRes = res.clone()

    try {
      bodyText = await clonedRes.text();
      responseType = 'text';
    } catch {
      bodyText = '[unreadable response body]';
      responseType = 'unknown';
    }
  }

  setSpanAttributes(span, {
    'httpResponse': bodyText,
    'httpResponseType': responseType
  })
}

/**
 * Extracts and serializes the request body for tracing.
 * Handles string, JSON, and Uint8Array bodies. Truncates long strings.
 * @param {RequestInit} options - Fetch options possibly containing a body
 * @returns {{body: string|undefined, type: string|undefined}} An object with the serialized body and its type
 */
function extractRequestBody(options) {
  if (options && options.body) {
    if (typeof options.body === 'string') {
      let type = 'string';
      // Try to detect JSON
      try {
        JSON.parse(options.body);
        type = 'json';
      } catch {}
      const body = options.body.length > 2048 ? options.body.slice(0, 2048) + '...[truncated]' : options.body;
      return { body, type };
    } else if (options.body instanceof Uint8Array) {
      return { body: '[binary body: Uint8Array]', type: 'binary' };
    } else {
      return { body: '[unhandled body type]', type: typeof options.body };
    }
  }
  return { body: undefined, type: undefined };
}

/**
 * Extracts query parameters from a URL string or Request object for tracing.
 * @param {string|Request} url - The URL or Request object
 * @returns {string|undefined} The query string (including '?'), or undefined if none
 */
function extractQueryParams(url) {
  let urlString = typeof url === 'string' ? url : (url && url.url ? url.url : undefined);
  if (!urlString) return undefined;
  try {
    const u = new URL(urlString, 'http://dummy-base'); // base for relative URLs
    return u.search ? u.search : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Drop-in replacement for fetch with OpenTelemetry tracing.
 * Traces HTTP method, URL, request body, and (for GET) query params.
 * @param {RequestInfo} url - The resource to fetch (string or Request)
 * @param {RequestInit} [options] - Fetch options (method, headers, body, etc.)
 * @param {object} parentContext - Parent context for trace propagation (required)
 * @returns {Promise<Response>} The fetch response
 */
export async function tracedFetch(url, options, parentContext) {
  const method = options?.method || (typeof url === 'object' && url.method) || 'GET'
  // --- Request body tracing ---
  const { body: requestBody, type: requestBodyType } = extractRequestBody(options);
  // --- Query params for GET ---
  let queryParams = undefined;
  if (method.toUpperCase() === 'GET') {
    queryParams = extractQueryParams(url);
  }
  return runWithSpan(`tomo.http.request`, {
    kind: SpanKind.CLIENT,
    attributes: {
      'httpMethod': method,
      'httpUrl': typeof url === 'string' ? url : url.url,
      ...(requestBody !== undefined ? { 'httpRequestBody': requestBody } : {}),
      ...(requestBodyType !== undefined ? { 'httpRequestBodyType': requestBodyType } : {}),
      ...(queryParams !== undefined ? { 'httpQueryParams': queryParams } : {})
    },
    parentContext
  }, async (span) => {
    try {
      const res = await fetch(url, options)
      setHttpSpanStatus(span, res)
      await setHTTPResponseBody(span, res)
      return res
    } catch (err) {
      setSpanAttributes(span, {
        'httpError': err && err.message ? err.message : String(err),
        'httpStatusCode': err && err.status ? err.status : 500
      })
      span.setStatus({ code: SpanStatusCode.ERROR })
      throw err
    }
  })
} 