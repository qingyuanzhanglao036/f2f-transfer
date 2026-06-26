// Cloudflare Pages Function - 下载接口

import { getTranslator } from './i18n';

interface Env {
  TRANSFERS: KVNamespace;
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const { request, env } = context;
    const t = getTranslator(request);
    const url = new URL(request.url);
    const code = url.searchParams.get('code');

    if (!code) {
      return new Response(JSON.stringify({ error: t('missingCode') }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 从 KV 获取数据
    const dataStr = await env.TRANSFERS.get(code);

    if (!dataStr) {
      return new Response(JSON.stringify({ error: t('codeNotFound') }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = JSON.parse(dataStr);

    // 返回数据 - 无需标记已下载，分享码可以多次使用
    return new Response(JSON.stringify({
      success: true,
      type: data.type,
      content: data.content,
      contentType: data.contentType || 'application/octet-stream',
      fileName: data.fileName
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error: any) {
    const t = getTranslator(context.request);
    return new Response(JSON.stringify({
      error: t('serverError') + error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// CORS 预检
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
