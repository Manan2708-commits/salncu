import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { PDFDocument, StandardFonts, rgb } from 'npm:pdf-lib@1.17.1';

interface Recipient { name: string; email: string }
interface Body {
  event_id: string;
  certificate_type: 'community_service' | 'general_proficiency';
  recipients: Recipient[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: claims } = await supabase.auth.getClaims(authHeader.replace('Bearer ', ''));
    if (!claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const userId = claims.claims.sub as string;

    // Role check: only admin or club_admin may issue certificates
    const { data: roleRow } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .in('role', ['admin', 'club_admin'])
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json() as Body;
    if (!body.event_id || !body.certificate_type || !Array.isArray(body.recipients) || body.recipients.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Validate recipients
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const r of body.recipients) {
      if (!r?.name || typeof r.name !== 'string' || r.name.length > 200 ||
          !r?.email || typeof r.email !== 'string' || !emailRe.test(r.email) || r.email.length > 320) {
        return new Response(JSON.stringify({ error: 'Invalid recipient entry' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }
    const escHtml = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }

    // Fetch template
    const { data: tpl, error: tplErr } = await admin.from('certificate_templates').select('*').eq('certificate_type', body.certificate_type).maybeSingle();
    if (tplErr || !tpl) {
      return new Response(JSON.stringify({ error: 'No template uploaded for this certificate type. Ask admin to upload one.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: event } = await admin.from('events').select('name, event_date').eq('id', body.event_id).maybeSingle();
    if (!event) {
      return new Response(JSON.stringify({ error: 'Event not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Download template
    const { data: tplFile, error: dlErr } = await admin.storage.from('certificate-templates').download(tpl.template_path);
    if (dlErr || !tplFile) {
      return new Response(JSON.stringify({ error: 'Could not load template PDF' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const tplBytes = new Uint8Array(await tplFile.arrayBuffer());

    const dateStr = new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    let issuedCount = 0;
    let emailedCount = 0;

    for (const rec of body.recipients) {
      try {
        const pdf = await PDFDocument.load(tplBytes);
        const page = pdf.getPages()[0];
        const font = await pdf.embedFont(StandardFonts.HelveticaBold);
        const color = rgb(0.1, 0.1, 0.2);

        page.drawText(rec.name, { x: tpl.name_x, y: tpl.name_y, size: tpl.font_size, font, color });
        page.drawText(event.name, { x: tpl.event_x, y: tpl.event_y, size: Math.max(14, tpl.font_size - 10), font, color });
        page.drawText(dateStr, { x: tpl.date_x, y: tpl.date_y, size: Math.max(12, tpl.font_size - 14), font, color });

        const pdfBytes = await pdf.save();
        const path = `${body.event_id}/${body.certificate_type}/${Date.now()}-${rec.email.replace(/[^a-z0-9]/gi, '_')}.pdf`;
        const { error: upErr } = await admin.storage.from('certificates').upload(path, pdfBytes, { contentType: 'application/pdf', upsert: true });
        if (upErr) throw upErr;

        let status: 'pending' | 'sent' | 'failed' = 'pending';
        let sentAt: string | null = null;
        let errMsg: string | null = null;

        // Send email via Resend gateway
        if (RESEND_API_KEY && LOVABLE_API_KEY) {
          try {
            const { data: signed } = await admin.storage.from('certificates').createSignedUrl(path, 60 * 60 * 24 * 30);
            const downloadUrl = signed?.signedUrl;
            const html = `
              <div style="font-family: sans-serif; max-width: 560px; margin: auto;">
                <h2 style="color: #4f46e5;">Congratulations, ${escHtml(rec.name)}!</h2>
                <p>You have been awarded a <strong>${escHtml(body.certificate_type.replace('_', ' '))}</strong> certificate for participating in <strong>${escHtml(event.name)}</strong>.</p>
                <p>Your certificate is attached and also available for download below.</p>
                ${downloadUrl ? `<p><a href="${downloadUrl}" style="background: #4f46e5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; display: inline-block;">Download Certificate</a></p>` : ''}
                <p style="color: #666; font-size: 12px; margin-top: 32px;">— Campus Events</p>
              </div>`;
            const b64 = btoa(String.fromCharCode(...pdfBytes));
            const resp = await fetch('https://connector-gateway.lovable.dev/resend/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LOVABLE_API_KEY}`,
                'X-Connection-Api-Key': RESEND_API_KEY,
              },
              body: JSON.stringify({
                from: 'Campus Events <onboarding@resend.dev>',
                to: [rec.email],
                subject: `Your ${body.certificate_type.replace('_', ' ')} Certificate – ${event.name}`,
                html,
                attachments: [{ filename: 'certificate.pdf', content: b64 }],
              }),
            });
            if (resp.ok) { status = 'sent'; sentAt = new Date().toISOString(); emailedCount++; }
            else { status = 'failed'; errMsg = await resp.text(); }
          } catch (e: any) {
            status = 'failed'; errMsg = e.message;
          }
        }

        await admin.from('certificates_issued').insert({
          event_id: body.event_id,
          certificate_type: body.certificate_type,
          recipient_name: rec.name,
          recipient_email: rec.email,
          certificate_path: path,
          issued_by: userId,
          status,
          sent_at: sentAt,
          error_message: errMsg,
        });
        issuedCount++;
      } catch (e: any) {
        await admin.from('certificates_issued').insert({
          event_id: body.event_id,
          certificate_type: body.certificate_type,
          recipient_name: rec.name,
          recipient_email: rec.email,
          issued_by: userId,
          status: 'failed',
          error_message: e.message,
        });
      }
    }

    return new Response(JSON.stringify({ issued: issuedCount, emailed: emailedCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
